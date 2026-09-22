-- ─────────────────────────────────────────────────────────────
--  FILTRAZON — MySQL Database Schema
--  Run this once to initialize the database
-- ─────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS filtrazon
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE filtrazon;

-- ── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          VARCHAR(36)   NOT NULL DEFAULT (UUID()),
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL,
  password    VARCHAR(255)  NOT NULL,   -- bcrypt hash
  role        ENUM('ADMIN','VIEWER') NOT NULL DEFAULT 'VIEWER',
  active      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login  DATETIME      NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ── devices ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
  id          VARCHAR(50)   NOT NULL,
  name        VARCHAR(100)  NOT NULL,
  type        ENUM('node','gateway') NOT NULL DEFAULT 'node',
  firmware    VARCHAR(50)   NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ── gateways ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gateways (
  id              VARCHAR(50)   NOT NULL,
  name            VARCHAR(100)  NOT NULL,
  lora_connected  TINYINT(1)    NOT NULL DEFAULT 0,
  wifi_connected  TINYINT(1)    NOT NULL DEFAULT 0,
  usb_connected   TINYINT(1)    NOT NULL DEFAULT 0,
  last_rssi       FLOAT         NULL,
  last_snr        FLOAT         NULL,
  queued_packets  INT           NOT NULL DEFAULT 0,
  last_sync       DATETIME      NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ── readings ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS readings (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  device_id     VARCHAR(50)     NOT NULL,
  seq           INT UNSIGNED    NOT NULL,
  uptime_ms     BIGINT UNSIGNED NOT NULL DEFAULT 0,
  ph            FLOAT           NOT NULL,
  tds           FLOAT           NOT NULL,
  turbidity     FLOAT           NOT NULL,
  flow_lpm      FLOAT           NOT NULL,
  lat           FLOAT           NULL,
  lon           FLOAT           NULL,
  total_liters  FLOAT           NOT NULL,
  pump_status   TINYINT(1)      NOT NULL DEFAULT 0,
  uv_status     TINYINT(1)      NOT NULL DEFAULT 0,
  relay1        TINYINT(1)      NOT NULL DEFAULT 0,
  relay2        TINYINT(1)      NOT NULL DEFAULT 0,
  relay3        TINYINT(1)      NOT NULL DEFAULT 0,
  relay4        TINYINT(1)      NOT NULL DEFAULT 0,
  flags         INT             NOT NULL DEFAULT 0,
  battery       FLOAT           NOT NULL DEFAULT 0,
  rssi          FLOAT           NOT NULL,
  snr           FLOAT           NOT NULL,
  gateway_id    VARCHAR(50)     NOT NULL,
  received_at   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_device_seq (device_id, seq),
  KEY idx_received_at  (received_at),
  KEY idx_device_id    (device_id),
  KEY idx_gateway_id   (gateway_id)
) ENGINE=InnoDB;

-- ── alerts ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  device_id   VARCHAR(50)     NOT NULL,
  gateway_id  VARCHAR(50)     NULL,
  severity    ENUM('critical','warning','info') NOT NULL DEFAULT 'warning',
  type        VARCHAR(50)     NOT NULL,
  message     TEXT            NOT NULL,
  value       VARCHAR(50)     NULL,
  threshold   VARCHAR(50)     NULL,
  status      ENUM('active','resolved') NOT NULL DEFAULT 'active',
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME        NULL,
  PRIMARY KEY (id),
  KEY idx_alerts_device    (device_id),
  KEY idx_alerts_severity  (severity),
  KEY idx_alerts_status    (status),
  KEY idx_alerts_created   (created_at)
) ENGINE=InnoDB;

-- ── device_tokens ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_tokens (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  device_id   VARCHAR(50)   NOT NULL,
  token_hash  VARCHAR(255)  NOT NULL,   -- bcrypt/sha256 of token
  last_used   DATETIME      NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  rotated_at  DATETIME      NULL,
  active      TINYINT(1)    NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_token_device (device_id),
  KEY idx_token_hash   (token_hash(64))
) ENGINE=InnoDB;

-- ── settings ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  category      VARCHAR(50)   NOT NULL,
  key_name      VARCHAR(100)  NOT NULL,
  value         TEXT          NOT NULL,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by    VARCHAR(36)   NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_settings_key (category, key_name)
) ENGINE=InnoDB;

-- ── security_logs ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS security_logs (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_type  VARCHAR(50)     NOT NULL,   -- login_success, login_fail, token_rotate, etc.
  user_id     VARCHAR(36)     NULL,
  email       VARCHAR(255)    NULL,
  ip          VARCHAR(45)     NULL,
  user_agent  TEXT            NULL,
  detail      TEXT            NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sec_event  (event_type),
  KEY idx_sec_user   (user_id),
  KEY idx_sec_email  (email),
  KEY idx_sec_time   (created_at)
) ENGINE=InnoDB;

-- ── Default seed data ─────────────────────────────────────────
INSERT IGNORE INTO devices (id, name, type) VALUES ('FILTRAZON-01', 'FILTRAZON NODE 01', 'node');
INSERT IGNORE INTO gateways (id, name) VALUES ('GW-01', 'GATEWAY 01');

-- Default thresholds in settings
INSERT IGNORE INTO settings (category, key_name, value) VALUES
  ('threshold', 'ph_min',                '6.5'),
  ('threshold', 'ph_max',                '8.5'),
  ('threshold', 'ph_warn_low',           '6.0'),
  ('threshold', 'ph_warn_high',          '9.0'),
  ('threshold', 'tds_safe_max',          '300'),
  ('threshold', 'tds_warn_max',          '500'),
  ('threshold', 'turbidity_safe_max',    '100'),
  ('threshold', 'turbidity_warn_max',    '500'),
  ('threshold', 'flow_min_when_pump_on', '0.5'),
  ('threshold', 'flow_warn_when_pump_on','0.1'),
  ('device',    'node_name',             'FILTRAZON NODE 01'),
  ('device',    'gateway_name',          'GATEWAY 01'),
  ('device',    'reporting_interval_s',  '5'),
  ('relay',     'relay1_name',           'Pompa Utama'),
  ('relay',     'relay2_name',           'UV Sterilizer'),
  ('relay',     'relay3_name',           'Relay 3'),
  ('relay',     'relay4_name',           'Relay 4');

-- Default admin user: admin@filtrazon.local / filtrazon2024
-- password hash: bcrypt of "filtrazon2024", cost 12
INSERT IGNORE INTO users (id, name, email, password, role) VALUES
  ('00000000-0000-0000-0000-000000000001',
   'Administrator',
   'admin@filtrazon.local',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TdFmZl.yk/mg5jyUVYFvMXz4e6Ny',
   'ADMIN');
