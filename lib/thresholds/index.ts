// ─────────────────────────────────────────────────────────────
//  FILTRAZON — Centralized threshold logic
//  Import and use these functions everywhere — never re-implement
// ─────────────────────────────────────────────────────────────

import type { StatusLevel, ThresholdResult, WaterThresholds } from '@/types'

// ── Default thresholds (matches /pengaturan defaults) ───────
export const DEFAULT_THRESHOLDS: WaterThresholds = {
  ph_min:                  6.5,
  ph_max:                  8.5,
  ph_warn_low:             6.0,
  ph_warn_high:            9.0,
  tds_safe_max:            300,
  tds_warn_max:            500,
  turbidity_safe_max:      100,
  turbidity_warn_max:      500,
  flow_min_when_pump_on:   0.5,
  flow_warn_when_pump_on:  0.1,
}

// ── pH ───────────────────────────────────────────────────────
export function evaluatePh(
  value: number,
  t: WaterThresholds = DEFAULT_THRESHOLDS,
): ThresholdResult {
  if (value < t.ph_warn_low || value > t.ph_warn_high) {
    return { status: 'danger', label: 'Danger', message: `pH ${value.toFixed(1)} is outside safe range` }
  }
  if (value < t.ph_min || value > t.ph_max) {
    return { status: 'warning', label: 'Warning', message: `pH ${value.toFixed(1)} approaching limits` }
  }
  return { status: 'safe', label: 'Normal', message: `pH ${value.toFixed(1)} is normal` }
}

// ── TDS ──────────────────────────────────────────────────────
export function evaluateTds(
  value: number,
  t: WaterThresholds = DEFAULT_THRESHOLDS,
): ThresholdResult {
  if (value > t.tds_warn_max) {
    return { status: 'danger', label: 'High', message: `TDS ${value} ppm exceeds danger threshold` }
  }
  if (value > t.tds_safe_max) {
    return { status: 'warning', label: 'Elevated', message: `TDS ${value} ppm is elevated` }
  }
  return { status: 'safe', label: 'Safe', message: `TDS ${value} ppm is within safe range` }
}

// ── Turbidity ────────────────────────────────────────────────
export function evaluateTurbidity(
  value: number,
  t: WaterThresholds = DEFAULT_THRESHOLDS,
): ThresholdResult {
  if (value > t.turbidity_warn_max) {
    return { status: 'danger', label: 'High', message: `Turbidity ${value} NTU is dangerously high` }
  }
  if (value > t.turbidity_safe_max) {
    return { status: 'warning', label: 'Cloudy', message: `Turbidity ${value} NTU is elevated` }
  }
  return { status: 'safe', label: 'Clear', message: `Turbidity ${value} NTU is clear` }
}

// ── Flow (context-aware: pump must be ON for flow check) ─────
export function evaluateFlow(
  value: number,
  pumpOn: boolean,
  t: WaterThresholds = DEFAULT_THRESHOLDS,
): ThresholdResult {
  if (!pumpOn) {
    return { status: 'safe', label: 'Idle', message: 'Pump is off' }
  }
  if (value <= 0) {
    return { status: 'danger', label: 'No Flow', message: 'Flow failure detected — pump is ON but no flow' }
  }
  if (value < t.flow_warn_when_pump_on) {
    return { status: 'danger', label: 'Critical Low', message: `Flow ${value.toFixed(1)} L/min is critically low` }
  }
  if (value < t.flow_min_when_pump_on) {
    return { status: 'warning', label: 'Low', message: `Flow ${value.toFixed(1)} L/min is below normal` }
  }
  return { status: 'safe', label: 'Normal', message: `Flow ${value.toFixed(1)} L/min is normal` }
}

// ── RSSI ─────────────────────────────────────────────────────
export function evaluateRssi(value: number): ThresholdResult {
  if (value < -110) {
    return { status: 'danger', label: 'Poor', message: `RSSI ${value} dBm — very weak signal` }
  }
  if (value < -90) {
    return { status: 'warning', label: 'Weak', message: `RSSI ${value} dBm — weak signal` }
  }
  return { status: 'safe', label: 'Good', message: `RSSI ${value} dBm — good signal` }
}

// ── SNR ──────────────────────────────────────────────────────
export function evaluateSnr(value: number): ThresholdResult {
  if (value < -5) {
    return { status: 'danger', label: 'Poor', message: `SNR ${value} dB — very noisy` }
  }
  if (value < 3) {
    return { status: 'warning', label: 'Marginal', message: `SNR ${value} dB — marginal` }
  }
  return { status: 'safe', label: 'Good', message: `SNR ${value} dB — good` }
}

// ── Battery ──────────────────────────────────────────────────
export function evaluateBattery(value: number): ThresholdResult {
  if (value <= 10) {
    return { status: 'danger', label: 'Critical', message: `Battery ${value}% — critical` }
  }
  if (value <= 25) {
    return { status: 'warning', label: 'Low', message: `Battery ${value}% — low` }
  }
  return { status: 'safe', label: 'OK', message: `Battery ${value}%` }
}

// ── UV + Flow cross-check ────────────────────────────────────
export function evaluateUvFlow(
  uvOn: boolean,
  flowLpm: number,
): ThresholdResult | null {
  if (uvOn && flowLpm <= 0) {
    return { status: 'warning', label: 'UV active without water flow', message: 'UV sterilizer is on but no water is flowing' }
  }
  return null
}

// ── Overall water quality (aggregate) ───────────────────────
export function evaluateWaterQuality(
  ph: number,
  tds: number,
  turbidity: number,
  flowLpm: number,
  pumpOn: boolean,
  t: WaterThresholds = DEFAULT_THRESHOLDS,
): ThresholdResult {
  const results = [
    evaluatePh(ph, t),
    evaluateTds(tds, t),
    evaluateTurbidity(turbidity, t),
    evaluateFlow(flowLpm, pumpOn, t),
  ]

  if (results.some(r => r.status === 'danger')) {
    const first = results.find(r => r.status === 'danger')!
    return { status: 'danger', label: 'DANGER', message: first.message }
  }
  if (results.some(r => r.status === 'warning')) {
    const first = results.find(r => r.status === 'warning')!
    return { status: 'warning', label: 'WARNING', message: first.message }
  }
  return { status: 'safe', label: 'SAFE', message: 'All parameters within safe range' }
}

// ── Connection freshness ──────────────────────────────────────
export function evaluateConnectionStatus(
  receivedAt: string | null | undefined,
): 'live' | 'stale' | 'offline' | 'connecting' {
  if (!receivedAt) return 'connecting'
  const ageMs = Date.now() - new Date(receivedAt).getTime()
  if (ageMs < 10_000)  return 'live'
  if (ageMs < 30_000)  return 'stale'
  return 'offline'
}

// ── Status → Tailwind color classes ──────────────────────────
export function statusClasses(status: StatusLevel): {
  text: string
  bg: string
  border: string
  badge: string
} {
  switch (status) {
    case 'safe':
      return {
        text:   'text-green-700',
        bg:     'bg-green-50',
        border: 'border-green-200',
        badge:  'status-safe',
      }
    case 'warning':
      return {
        text:   'text-amber-700',
        bg:     'bg-amber-50',
        border: 'border-amber-200',
        badge:  'status-warning',
      }
    case 'danger':
      return {
        text:   'text-red-700',
        bg:     'bg-red-50',
        border: 'border-red-200',
        badge:  'status-danger',
      }
    case 'offline':
    default:
      return {
        text:   'text-gray-500',
        bg:     'bg-gray-50',
        border: 'border-gray-200',
        badge:  'status-offline',
      }
  }
}

// ── Generate alert messages from a reading ───────────────────
export interface AlertCandidate {
  type: string
  severity: 'critical' | 'warning'
  message: string
  value: number | string
  threshold: number | string
}

export function generateAlertCandidates(
  ph: number,
  tds: number,
  turbidity: number,
  flowLpm: number,
  pumpOn: boolean,
  uvOn: boolean,
  rssi: number,
  t: WaterThresholds = DEFAULT_THRESHOLDS,
): AlertCandidate[] {
  const alerts: AlertCandidate[] = []

  const phResult = evaluatePh(ph, t)
  if (phResult.status === 'danger')  alerts.push({ type: 'ph_danger',  severity: 'critical', message: phResult.message!, value: ph, threshold: `${t.ph_warn_low}–${t.ph_warn_high}` })
  else if (phResult.status === 'warning') alerts.push({ type: 'ph_warning', severity: 'warning',  message: phResult.message!, value: ph, threshold: `${t.ph_min}–${t.ph_max}` })

  const tdsResult = evaluateTds(tds, t)
  if (tdsResult.status === 'danger')  alerts.push({ type: 'tds_danger',  severity: 'critical', message: tdsResult.message!, value: tds, threshold: t.tds_warn_max })
  else if (tdsResult.status === 'warning') alerts.push({ type: 'tds_warning', severity: 'warning',  message: tdsResult.message!, value: tds, threshold: t.tds_safe_max })

  const turbResult = evaluateTurbidity(turbidity, t)
  if (turbResult.status === 'danger')  alerts.push({ type: 'turbidity_danger',  severity: 'critical', message: turbResult.message!, value: turbidity, threshold: t.turbidity_warn_max })
  else if (turbResult.status === 'warning') alerts.push({ type: 'turbidity_warning', severity: 'warning',  message: turbResult.message!, value: turbidity, threshold: t.turbidity_safe_max })

  const flowResult = evaluateFlow(flowLpm, pumpOn, t)
  if (flowResult.status === 'danger')  alerts.push({ type: 'flow_failure', severity: 'critical', message: flowResult.message!, value: flowLpm, threshold: t.flow_min_when_pump_on })
  else if (flowResult.status === 'warning') alerts.push({ type: 'flow_low',     severity: 'warning',  message: flowResult.message!, value: flowLpm, threshold: t.flow_min_when_pump_on })

  const uvFlowIssue = evaluateUvFlow(uvOn, flowLpm)
  if (uvFlowIssue) alerts.push({ type: 'uv_no_flow', severity: 'warning', message: uvFlowIssue.message!, value: flowLpm, threshold: 0 })

  const rssiResult = evaluateRssi(rssi)
  if (rssiResult.status === 'danger')  alerts.push({ type: 'rssi_poor', severity: 'critical', message: rssiResult.message!, value: rssi, threshold: -110 })
  else if (rssiResult.status === 'warning') alerts.push({ type: 'rssi_weak', severity: 'warning',  message: rssiResult.message!, value: rssi, threshold: -90 })

  return alerts
}
