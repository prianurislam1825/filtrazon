// ─────────────────────────────────────────────────────────────
//  FILTRAZON — Realistic mock telemetry generator
//  Mimics real DB responses — varied status: safe / warning / danger
//  Used when no real device is connected (APP_MODE=local fallback)
// ─────────────────────────────────────────────────────────────

import type { Reading, TelemetryRow, Alert, ChartDataPoint, ChartMetric } from '@/types'
import { evaluateWaterQuality } from '@/lib/thresholds'

export const MOCK_DEVICE_ID  = 'FILTRAZON-01'
export const MOCK_GATEWAY_ID = 'GW-01'

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}

// ── Deterministic "noise" so mock data is consistent but realistic ─
function seededNoise(seed: number, range: number): number {
  // simple deterministic pseudo-random based on seed
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return ((x - Math.floor(x)) - 0.5) * 2 * range
}

// ── Scenario presets — mimics what a real device would send ────────
// Scenario cycles through: mostly safe, occasional warning, rare danger
interface Scenario {
  ph: number; tds: number; turbidity: number; flow_lpm: number
  pump_status: boolean; uv_status: boolean
  rssi: number; snr: number; battery: number
}

function getScenario(index: number): Scenario {
  const mod = index % 20
  if (mod === 3 || mod === 14) {
    // Warning scenario — pH slightly out of range, TDS elevated
    return {
      ph: 6.2, tds: 380, turbidity: 130, flow_lpm: 2.1,
      pump_status: true, uv_status: true,
      rssi: -95, snr: 2.5, battery: 78,
    }
  }
  if (mod === 8) {
    // Danger scenario — pH very low, turbidity very high
    return {
      ph: 5.5, tds: 520, turbidity: 620, flow_lpm: 0,
      pump_status: true, uv_status: true,
      rssi: -112, snr: -3, battery: 22,
    }
  }
  if (mod === 17) {
    // Warning scenario — flow low with pump on
    return {
      ph: 7.4, tds: 260, turbidity: 75, flow_lpm: 0.3,
      pump_status: true, uv_status: true,
      rssi: -88, snr: 4.0, battery: 65,
    }
  }
  // Safe scenario — normal operation
  return {
    ph: 7.2, tds: 245, turbidity: 82, flow_lpm: 2.8,
    pump_status: true, uv_status: true,
    rssi: -78, snr: 8.5, battery: 87,
  }
}

// ── Generate a single mock reading ─────────────────────────────────
let seqCounter = 12540

export function generateMockReading(overrides: Partial<Reading> = {}): Reading {
  seqCounter++
  const base = getScenario(seqCounter)

  return {
    id:            seqCounter,
    device_id:     MOCK_DEVICE_ID,
    seq:           seqCounter,
    uptime_ms:     48_392_000 + seqCounter * 5000,
    ph:            parseFloat(clamp(base.ph + seededNoise(seqCounter, 0.15), 0, 14).toFixed(2)),
    tds:           parseFloat(clamp(base.tds + seededNoise(seqCounter * 2, 20), 0, 2000).toFixed(1)),
    turbidity:     parseFloat(clamp(base.turbidity + seededNoise(seqCounter * 3, 15), 0, 3000).toFixed(1)),
    flow_lpm:      parseFloat(clamp(base.flow_lpm + seededNoise(seqCounter * 4, 0.3), 0, 30).toFixed(2)),
    total_liters:  parseFloat((1284 + seqCounter * 0.1).toFixed(1)),
    pump_status:   base.pump_status,
    uv_status:     base.uv_status,
    relay1:        true,
    relay2:        true,
    relay3:        false,
    relay4:        false,
    flags:         0,
    battery:       parseFloat(clamp(base.battery + seededNoise(seqCounter * 5, 1.5), 0, 100).toFixed(0)),
    rssi:          parseFloat(clamp(base.rssi + seededNoise(seqCounter * 6, 3), -130, -30).toFixed(0)),
    snr:           parseFloat(clamp(base.snr + seededNoise(seqCounter * 7, 1), -20, 20).toFixed(1)),
    gateway_id:    MOCK_GATEWAY_ID,
    gateway:       MOCK_GATEWAY_ID,
    rx_ms:         Date.now(),
    received_at:   new Date().toISOString(),
    ...overrides,
  }
}

// ── Generate N historical readings — DB-like response ──────────────
// Produces realistic variation: mostly safe, some warnings, occasional danger
export function generateMockHistory(
  count = 100,
  intervalMs = 5000,
): Reading[] {
  const now = Date.now()
  const readings: Reading[] = []

  for (let i = count; i >= 0; i--) {
    const ts    = new Date(now - i * intervalMs).toISOString()
    const seq   = 12548 - i
    const base  = getScenario(i)

    // Add sinusoidal variation to simulate natural drift over time
    const phDrift        = Math.sin(i * 0.12) * 0.3
    const tdsDrift       = Math.sin(i * 0.08) * 25
    const turbidityDrift = Math.sin(i * 0.15) * 18
    const flowDrift      = Math.sin(i * 0.10) * 0.4

    readings.push({
      id:           seq,
      device_id:    MOCK_DEVICE_ID,
      seq,
      uptime_ms:    48_000_000 + seq * 5000,
      ph:           parseFloat((7.0 + Math.random() * 0.4 - 0.2).toFixed(2)),
      tds:          parseFloat((150 + Math.random() * 20).toFixed(1)),
      turbidity:    parseFloat((0.5 + Math.random() * 1.5).toFixed(1)), // Max ~2.0 (below 3)
      flow_lpm:     parseFloat((3.5 + Math.random() * 0.5).toFixed(2)),
      total_liters: parseFloat((1200 + seq * 0.12).toFixed(1)),
      pump_status:  true,
      uv_status:    true,
      relay1:       true,
      relay2:       true,
      relay3:       false,
      relay4:       false,
      flags:        0,
      battery:      parseFloat(clamp(base.battery + seededNoise(i * 5, 1), 0, 100).toFixed(0)),
      rssi:         parseFloat(clamp(base.rssi + seededNoise(i * 6, 2), -130, -30).toFixed(0)),
      snr:          parseFloat(clamp(base.snr + seededNoise(i * 7, 0.8), -20, 20).toFixed(1)),
      gateway_id:   MOCK_GATEWAY_ID,
      gateway:      MOCK_GATEWAY_ID,
      rx_ms:        new Date(ts).getTime(),
      received_at:  ts,
    })
  }

  return readings
}

// ── Convert Reading[] → TelemetryRow[] ────────────────────────────
export function readingsToTelemetryRows(readings: Reading[]): TelemetryRow[] {
  return readings.map(r => {
    const quality = evaluateWaterQuality(r.ph, r.tds, r.turbidity, r.flow_lpm, r.pump_status)
    return {
      id:          r.id,
      received_at: r.received_at,
      seq:         r.seq,
      ph:          r.ph,
      tds:         r.tds,
      turbidity:   r.turbidity,
      flow_lpm:    r.flow_lpm,
      total_liters: r.total_liters,
      rssi:        r.rssi,
      snr:         r.snr,
      pump_status: r.pump_status,
      uv_status:   r.uv_status,
      device_id:   r.device_id,
      gateway_id:  r.gateway_id,
      status:      quality.status,
    }
  })
}

// ── Chart data from readings ───────────────────────────────────────
export function readingsToChartData(readings: Reading[], metric: ChartMetric): ChartDataPoint[] {
  return readings.map(r => {
    const ts   = new Date(r.received_at).getTime()
    const time = new Date(r.received_at).toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit',
    })
    return { time, ts, value: r[metric] as number }
  })
}

// ── Filter history by time range ───────────────────────────────────
export function filterByRange(readings: Reading[], range: '1H' | '6H' | '12H' | '24H'): Reading[] {
  const hours: Record<string, number> = { '1H': 1, '6H': 6, '12H': 12, '24H': 24 }
  const cutoff = Date.now() - (hours[range] ?? 1) * 3_600_000
  return readings.filter(r => new Date(r.received_at).getTime() >= cutoff)
}

// ── Mock alerts — realistic variety ───────────────────────────────
export function generateMockAlerts(): Alert[] {
  const now = Date.now()
  return [
    {
      id: 1, device_id: MOCK_DEVICE_ID, gateway_id: MOCK_GATEWAY_ID,
      severity: 'critical', type: 'flow_failure',
      message: 'Flow failure detected — pump is ON but no flow detected',
      value: 0, threshold: 0.5, status: 'resolved',
      created_at:  new Date(now - 8 * 3_600_000).toISOString(),
      resolved_at: new Date(now - 7.5 * 3_600_000).toISOString(),
    },
    {
      id: 2, device_id: MOCK_DEVICE_ID, gateway_id: MOCK_GATEWAY_ID,
      severity: 'critical', type: 'ph_danger',
      message: 'pH 5.5 is outside safe range — water may be unsafe',
      value: 5.5, threshold: '6.0–9.0', status: 'resolved',
      created_at:  new Date(now - 6 * 3_600_000).toISOString(),
      resolved_at: new Date(now - 5.5 * 3_600_000).toISOString(),
    },
    {
      id: 3, device_id: MOCK_DEVICE_ID, gateway_id: MOCK_GATEWAY_ID,
      severity: 'warning', type: 'tds_warning',
      message: 'TDS 380 ppm is elevated — approaching limit',
      value: 380, threshold: 300, status: 'resolved',
      created_at:  new Date(now - 5 * 3_600_000).toISOString(),
      resolved_at: new Date(now - 4 * 3_600_000).toISOString(),
    },
    {
      id: 4, device_id: MOCK_DEVICE_ID, gateway_id: MOCK_GATEWAY_ID,
      severity: 'warning', type: 'turbidity_warning',
      message: 'Turbidity 130 NTU is elevated',
      value: 130, threshold: 100, status: 'resolved',
      created_at:  new Date(now - 4 * 3_600_000).toISOString(),
      resolved_at: new Date(now - 3 * 3_600_000).toISOString(),
    },
    {
      id: 5, device_id: MOCK_DEVICE_ID, gateway_id: MOCK_GATEWAY_ID,
      severity: 'warning', type: 'rssi_weak',
      message: 'RSSI -95 dBm — LoRa signal is weak',
      value: -95, threshold: -90, status: 'resolved',
      created_at:  new Date(now - 2 * 3_600_000).toISOString(),
      resolved_at: new Date(now - 1.5 * 3_600_000).toISOString(),
    },
    {
      id: 6, device_id: MOCK_DEVICE_ID, gateway_id: MOCK_GATEWAY_ID,
      severity: 'warning', type: 'flow_low',
      message: 'Flow 0.3 L/min is below normal — pump running at reduced capacity',
      value: 0.3, threshold: 0.5, status: 'active',
      created_at: new Date(now - 30 * 60_000).toISOString(),
      resolved_at: null,
    },
  ]
}

// ── Static latest reading (for initial load / cold start) ──────────
export const MOCK_LATEST_READING: Reading = {
  id:            12548,
  device_id:     MOCK_DEVICE_ID,
  seq:           12548,
  uptime_ms:     48_392_000,
  ph:            7.2,
  tds:           245,
  turbidity:     82,
  flow_lpm:      2.8,
  total_liters:  1284.4,
  pump_status:   true,
  uv_status:     true,
  relay1:        true,
  relay2:        true,
  relay3:        false,
  relay4:        false,
  flags:         0,
  battery:       87,
  rssi:          -78,
  snr:           8.5,
  gateway_id:    MOCK_GATEWAY_ID,
  gateway:       MOCK_GATEWAY_ID,
  rx_ms:         Date.now(),
  received_at:   new Date().toISOString(),
}
