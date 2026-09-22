// ─────────────────────────────────────────────────────────────
//  FILTRAZON — Central TypeScript type definitions
// ─────────────────────────────────────────────────────────────

// ── Node Payload (from ESP32 / LoRa node) ──────────────────
export interface NodePayload {
  device_id: string
  seq: number
  uptime_ms: number
  ph: number
  tds: number
  turbidity: number
  flow_lpm: number
    lat?: number
    lon?: number
  total_liters: number
  pump_status: boolean
  uv_status: boolean
  relay1: boolean
  relay2: boolean
  relay3: boolean
  relay4: boolean
  flags: number   // bitmask: bit3 (0x08) = demo mode, 0 = normal
  battery: number
}

// ── Gateway Metadata (added by gateway) ────────────────────
export interface GatewayMetadata {
  rssi: number
  snr: number
  gateway: string
  rx_ms: number
}

// ── Server Metadata (added by /api/ingest) ─────────────────
export interface ServerMetadata {
  received_at: string // ISO string, server-generated
}

// ── Full Reading (NodePayload + Gateway + Server) ──────────
export interface Reading extends NodePayload, GatewayMetadata, ServerMetadata {
  id: number
  gateway_id: string
}

// ── Ingest Request body ────────────────────────────────────
export type IngestPayload = NodePayload & GatewayMetadata

// ── Status levels ──────────────────────────────────────────
export type StatusLevel = 'safe' | 'warning' | 'danger' | 'offline' | 'unknown'

// ── Connection / data freshness ────────────────────────────
export type ConnectionStatus = 'live' | 'stale' | 'offline' | 'connecting'

// ── Threshold evaluation result ───────────────────────────
export interface ThresholdResult {
  status: StatusLevel
  label: string
  message?: string
}

// ── Alert ──────────────────────────────────────────────────
export type AlertSeverity = 'critical' | 'warning' | 'info'
export type AlertStatus   = 'active' | 'resolved'

export interface Alert {
  id: number
  device_id: string
  gateway_id?: string
  severity: AlertSeverity
  type: string
  message: string
  value?: number | string
  threshold?: number | string
  status: AlertStatus
  created_at: string
  resolved_at?: string | null
}

// ── Device ─────────────────────────────────────────────────
export type DeviceStatus = 'online' | 'offline' | 'warning'

export interface Device {
  id: string
  name: string
  type: 'node' | 'gateway'
  status: DeviceStatus
  last_seen: string | null
  uptime_ms?: number
  battery?: number
  firmware?: string
  sd_backup?: boolean
  last_seq?: number
}

export interface Gateway extends Device {
  type: 'gateway'
  lora_connected: boolean
  wifi_connected: boolean
  usb_connected: boolean
  last_rssi?: number
  last_snr?: number
  queued_packets?: number
  last_sync?: string | null
}

// ── SSE Event payloads ────────────────────────────────────
export type SSEEventType = 'reading' | 'alert' | 'heartbeat'

export interface SSEReadingEvent {
  type: 'reading'
  data: Reading
}

export interface SSEAlertEvent {
  type: 'alert'
  data: Alert
}

export interface SSEHeartbeatEvent {
  type: 'heartbeat'
  ts: string
}

export type SSEEvent = SSEReadingEvent | SSEAlertEvent | SSEHeartbeatEvent

// ── Auth / User ───────────────────────────────────────────
export type UserRole = 'ADMIN' | 'VIEWER'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  created_at: string
  last_login?: string | null
}

// ── Settings ──────────────────────────────────────────────
export interface WaterThresholds {
  ph_min: number
  ph_max: number
  ph_warn_low: number
  ph_warn_high: number
  tds_safe_max: number
  tds_warn_max: number
  turbidity_safe_max: number
  turbidity_warn_max: number
  flow_min_when_pump_on: number
  flow_warn_when_pump_on: number
}

export interface DeviceSettings {
  node_name: string
  gateway_name: string
  reporting_interval_s: number
}

export interface RelaySettings {
  relay1_name: string
  relay2_name: string
  relay3_name: string
  relay4_name: string
}

export interface AppSettings {
  thresholds: WaterThresholds
  device: DeviceSettings
  relays: RelaySettings
}

// ── History query params ──────────────────────────────────
export interface HistoryQuery {
  device_id?: string
  from?: string   // ISO date string
  to?: string     // ISO date string
  status?: StatusLevel
  limit?: number
  offset?: number
}

// ── API response wrappers ─────────────────────────────────
export interface ApiSuccess<T> {
  ok: true
  data: T
}

export interface ApiError {
  ok: false
  error: string
  code?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ── Dashboard store / state ───────────────────────────────
export interface DashboardState {
  latestReading: Reading | null
  connectionStatus: ConnectionStatus
  lastUpdated: number | null   // Date.now() timestamp
}

// ── App mode ─────────────────────────────────────────────
export type AppMode = 'cloud' | 'local'

export interface AppConfig {
  mode: AppMode
  authEnabled: boolean
}

// ── Firebase sync types ───────────────────────────────────
export interface FirebaseReading {
  device_id:    string
  gateway:      string
  seq:          number
  uptime_ms:    number
  ph:           number
  tds:          number
  turbidity:    number
  flow_lpm:     number
  total_liters: number
  pump_status:  boolean
  uv_status:    boolean
  relay1:       boolean
  relay2:       boolean
  relay3:       boolean
  relay4:       boolean
  flags:        number   // bitmask: bit3 = demo mode
  battery:      number
  rssi:         number
  snr:          number
  rx_ms:        number
    lat?:         number
    lon?:         number
  fetched_at:   string   // ISO — when backend fetched from Firebase
}

// ── Relay command ─────────────────────────────────────────
export type RelayCommand =
  | 'R1ON' | 'R1OFF'
  | 'R2ON' | 'R2OFF'
  | 'R3ON' | 'R3OFF'
  | 'R4ON' | 'R4OFF'
  | 'ALLON' | 'ALLOFF'
  | 'FLOWRESET'
  | 'DEMOON' | 'DEMOOFF'

export interface RelayCommandResult {
  ok:        boolean
  command:   string
  sentAt:    string
  error?:    string
}

export type SyncState = 'synced' | 'syncing' | 'diff' | 'no-local' | 'error' | 'unknown'

export interface SyncStatus {
  state:             SyncState
  lastFirebaseUpdate: string | null   // ISO
  lastLocalSync:      string | null   // ISO
  firebaseConnected:  boolean
  localDbConnected:   boolean
  firebaseSeq:        number | null
  localSeq:           number | null
  error?:             string
}

// ── Chart data point ──────────────────────────────────────
export interface ChartDataPoint {
  time: string   // display label e.g. "14:32"
  ts: number     // epoch ms for sorting
  value: number
}

export type ChartMetric = 'ph' | 'tds' | 'turbidity' | 'flow_lpm'
export type ChartRange  = '1H' | '6H' | '12H' | '24H'

// ── Telemetry row (for table / cards) ────────────────────
export interface TelemetryRow {
  id: number
  received_at: string
  seq: number
  ph: number
  tds: number
  turbidity: number
  flow_lpm: number
    lat?: number
    lon?: number
  total_liters: number
  rssi: number
  snr: number
  pump_status: boolean
  uv_status: boolean
  device_id: string
  gateway_id: string
  status: StatusLevel
}
