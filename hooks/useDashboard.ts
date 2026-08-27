'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type {
  Reading, Alert, ConnectionStatus, ChartDataPoint,
  ChartMetric, ChartRange, FirebaseReading, SyncStatus,
} from '@/types'
import { evaluateConnectionStatus, DEFAULT_THRESHOLDS } from '@/lib/thresholds'
import { readingsToTelemetryRows } from '@/lib/mock/telemetry'

const RECONNECT_DELAY_MS  = 3000
const MAX_RECENT          = 10    // rows in telemetry table
const FIREBASE_POLL_MS    = 5000  // poll Firebase every 5s
const SYNC_STATUS_POLL_MS = 7000  // poll sync status

export function useDashboard() {
  const [latestReading,      setLatestReading]      = useState<Reading | null>(null)
  const [recentReadings,     setRecentReadings]      = useState<Reading[]>([])
  const [connectionStatus,   setConnectionStatus]   = useState<ConnectionStatus>('connecting')
  const [alerts,             setAlerts]             = useState<Alert[]>([])
  const [chartMetric,        setChartMetric]        = useState<ChartMetric>('ph')
  const [chartRange,         setChartRange]         = useState<ChartRange>('1H')
  const [chartData,          setChartData]          = useState<ChartDataPoint[]>([])
  const [sseError,           setSseError]           = useState(false)

  // Firebase state
  const [firebaseReading,    setFirebaseReadingState] = useState<FirebaseReading | null>(null)
  const [syncStatus,         setSyncStatus]           = useState<SyncStatus | null>(null)
  const [lastFirebaseUpdate, setLastFirebaseUpdate]   = useState<string | null>(null)

  const esRef             = useRef<EventSource | null>(null)
  const reconnectTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const recentRef         = useRef<Reading[]>([])
  const firebasePollRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const syncPollRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const chartPollRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const chartMetricRef    = useRef<ChartMetric>('ph')
  const chartRangeRef     = useRef<ChartRange>('1H')

  // keep refs in sync with state for use inside intervals
  useEffect(() => { chartMetricRef.current = chartMetric }, [chartMetric])
  useEffect(() => { chartRangeRef.current  = chartRange  }, [chartRange])

  // ── Fetch initial latest ───────────────────────────────
  useEffect(() => {
    fetch('/api/latest')
      .then(r => r.json())
      .then(data => {
        if (data.ok && data.data) {
          const r: Reading = data.data
          setLatestReading(r)
          recentRef.current = [r]
          setRecentReadings([r])
          setConnectionStatus(evaluateConnectionStatus(r.received_at))
        }
      })
      .catch(() => {})
  }, [])

  // ── Chart data dari /api/history (sumber yang sama dengan halaman Riwayat) ──
  const fetchChartData = useCallback(async (metric?: ChartMetric, range?: ChartRange) => {
    const m = metric ?? chartMetricRef.current
    const r = range  ?? chartRangeRef.current

    // Hitung rentang waktu berdasarkan range yang dipilih
    const hours: Record<string, number> = { '1H': 1, '6H': 6, '12H': 12, '24H': 24 }
    const fromMs  = Date.now() - (hours[r] ?? 1) * 3_600_000
    const fromIso = new Date(fromMs).toISOString()

    try {
      const res  = await fetch(
        `/api/history?device_id=FILTRAZON-01&from=${encodeURIComponent(fromIso)}&limit=500`,
        { cache: 'no-store' },
      )
      const json = await res.json()
      if (!json.ok || !Array.isArray(json.data)) return

      // Convert TelemetryRow[] → ChartDataPoint[]
      // TelemetryRow punya: received_at, ph, tds, turbidity, flow_lpm
      const metricKey = m as 'ph' | 'tds' | 'turbidity' | 'flow_lpm'
      const showSeconds = (hours[r] ?? 1) <= 1

      const points: ChartDataPoint[] = (json.data as Array<{
        received_at: string
        ph: number; tds: number; turbidity: number; flow_lpm: number
      }>)
        .slice()
        .reverse()                             // ascending chronological order
        .map(row => {
          const date = new Date(row.received_at)
          const time = date.toLocaleTimeString('id-ID', {
            hour:   '2-digit',
            minute: '2-digit',
            ...(showSeconds ? { second: '2-digit' } : {}),
          })
          return {
            time,
            ts:    date.getTime(),
            value: row[metricKey] ?? 0,
          }
        })

      setChartData(points)
    } catch {}
  }, [])

  // Fetch chart whenever metric or range changes
  useEffect(() => {
    fetchChartData(chartMetric, chartRange)
  }, [chartMetric, chartRange, fetchChartData])

  // Refresh chart every 30s
  useEffect(() => {
    chartPollRef.current = setInterval(() => fetchChartData(), 30_000)
    return () => { if (chartPollRef.current) clearInterval(chartPollRef.current) }
  }, [fetchChartData])

  // ── Firebase polling ───────────────────────────────────
  const pollFirebase = useCallback(async () => {
    try {
      const res  = await fetch('/api/firebase-sync', { cache: 'no-store' })
      const json = await res.json()

      if (!json.ok || !json.firebase) return

      const fb: FirebaseReading = json.firebase
      setFirebaseReadingState(fb)
      setLastFirebaseUpdate(fb.fetched_at)

      // Build Reading from Firebase — update EVERY fetch so relay/pump status is fresh
      const r: Reading = {
        id:           fb.seq,
        device_id:    fb.device_id,
        seq:          fb.seq,
        uptime_ms:    fb.uptime_ms,
        ph:           fb.ph,
        tds:          fb.tds,
        turbidity:    fb.turbidity,
        flow_lpm:     fb.flow_lpm,
        total_liters: fb.total_liters,
        pump_status:  fb.pump_status,
        uv_status:    fb.uv_status,
        relay1:       fb.relay1,
        relay2:       fb.relay2,
        relay3:       fb.relay3,
        relay4:       fb.relay4,
        flags:        fb.flags,
        battery:      fb.battery,
        rssi:         fb.rssi,
        snr:          fb.snr,
        gateway_id:   fb.gateway,
        gateway:      fb.gateway,
        rx_ms:        fb.rx_ms,
        received_at:  fb.fetched_at,
      }

      setLatestReading(r)
      setSseError(false)
      setConnectionStatus(evaluateConnectionStatus(r.received_at))

      // Add to recent only if new seq
      if (json.isNewSeq) {
        recentRef.current = [r, ...recentRef.current].slice(0, MAX_RECENT)
        setRecentReadings([...recentRef.current])
        // Refresh chart on new data
        fetchChartData()
      }
    } catch {}
  }, [fetchChartData])

  // ── Sync status polling ────────────────────────────────
  const pollSyncStatus = useCallback(async () => {
    try {
      const res  = await fetch('/api/sync-status', { cache: 'no-store' })
      const json = await res.json()
      if (json.ok && json.data) setSyncStatus(json.data)
    } catch {}
  }, [])

  useEffect(() => {
    pollFirebase()
    pollSyncStatus()
    firebasePollRef.current = setInterval(pollFirebase,    FIREBASE_POLL_MS)
    syncPollRef.current     = setInterval(pollSyncStatus,  SYNC_STATUS_POLL_MS)
    return () => {
      if (firebasePollRef.current) clearInterval(firebasePollRef.current)
      if (syncPollRef.current)     clearInterval(syncPollRef.current)
    }
  }, [pollFirebase, pollSyncStatus])

  // ── SSE (push from firebase-sync broadcast) ────────────
  const connectSSE = useCallback(() => {
    if (esRef.current) esRef.current.close()
    setSseError(false)

    const es = new EventSource('/api/live')
    esRef.current = es

    es.addEventListener('reading', (e: MessageEvent) => {
      try {
        const reading: Reading = JSON.parse(e.data)
        // SSE reading is authoritative — always update
        setLatestReading(reading)
        setSseError(false)
        setConnectionStatus(evaluateConnectionStatus(reading.received_at))
      } catch {}
    })

    es.addEventListener('alert', (e: MessageEvent) => {
      try {
        const alert: Alert = JSON.parse(e.data)
        setAlerts(prev => [alert, ...prev].slice(0, 50))
      } catch {}
    })

    es.addEventListener('heartbeat', () => {
      setLatestReading(prev => {
        if (prev) setConnectionStatus(evaluateConnectionStatus(prev.received_at))
        return prev
      })
    })

    es.onerror = () => {
      es.close()
      setSseError(true)
      reconnectTimer.current = setTimeout(connectSSE, RECONNECT_DELAY_MS)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    connectSSE()
    return () => {
      esRef.current?.close()
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Connection staleness check ─────────────────────────
  useEffect(() => {
    if (!latestReading) return
    const timer = setInterval(() => {
      setConnectionStatus(evaluateConnectionStatus(latestReading.received_at))
    }, 5000)
    return () => clearInterval(timer)
  }, [latestReading])

  const telemetryRows = readingsToTelemetryRows(recentReadings)

  return {
    latestReading,
    recentReadings,
    telemetryRows,
    connectionStatus,
    alerts,
    sseError,
    chartMetric,
    chartRange,
    chartData,
    setChartMetric,
    setChartRange,
    reconnect:          connectSSE,
    thresholds:         DEFAULT_THRESHOLDS,
    firebaseReading,
    syncStatus,
    lastFirebaseUpdate,
  }
}
