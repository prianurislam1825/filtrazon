'use client'

import { useMemo } from 'react'
import { Droplets, Gauge, Waves, Activity, Container, WifiOff } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import MetricCard from '@/components/dashboard/MetricCard'
import WaterQualityCard from '@/components/dashboard/WaterQualityCard'
import WaterAdviceCard from '@/components/dashboard/WaterAdviceCard'
import TreatmentStatus from '@/components/dashboard/TreatmentStatus'
import LoRaStatusCard from '@/components/dashboard/LoRaStatusCard'
import RealtimeChart from '@/components/charts/RealtimeChart'
import TelemetryTable from '@/components/telemetry/TelemetryTable'
import EmptyState from '@/components/ui/EmptyState'
import { MetricCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { useDashboard } from '@/hooks/useDashboard'
import { useLang } from '@/lib/i18n/context'
import {
  evaluatePh, evaluateTds, evaluateTurbidity,
  evaluateFlow, evaluateWaterQuality,
} from '@/lib/thresholds'

function formatUptime(ms: number): string {
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`
  return `${h}h ${m}m`
}

function formatLastUpdate(iso: string, lang: 'id' | 'en'): string {
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 10_000) return lang === 'id' ? 'Baru saja' : 'Just now'
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`
  return `${Math.floor(ms / 60_000)}m ago`
}

const STATUS_LABEL_MAP: Record<string, Record<'id' | 'en', string>> = {
  'Normal':      { id: 'Normal',         en: 'Normal'       },
  'Safe':        { id: 'Aman',           en: 'Safe'         },
  'Warning':     { id: 'Peringatan',     en: 'Warning'      },
  'Danger':      { id: 'Bahaya',         en: 'Danger'       },
  'High':        { id: 'Tinggi',         en: 'High'         },
  'Elevated':    { id: 'Meningkat',      en: 'Elevated'     },
  'Clear':       { id: 'Jernih',         en: 'Clear'        },
  'Cloudy':      { id: 'Keruh',          en: 'Cloudy'       },
  'No Flow':     { id: 'Tidak Mengalir', en: 'No Flow'      },
  'Idle':        { id: 'Diam',           en: 'Idle'         },
  'Good':        { id: 'Bagus',          en: 'Good'         },
  'Weak':        { id: 'Lemah',          en: 'Weak'         },
  'Poor':        { id: 'Buruk',          en: 'Poor'         },
  'Accumulated': { id: 'Terakumulasi',   en: 'Accumulated'  },
  'Low':         { id: 'Rendah',         en: 'Low'          },
  'Critical Low':{ id: 'Kritis',         en: 'Critical Low' },
  'Critical':    { id: 'Kritis',         en: 'Critical'     },
  'OK':          { id: 'OK',             en: 'OK'           },
}

const QUALITY_LABEL_MAP: Record<string, Record<'id' | 'en', string>> = {
  'SAFE':    { id: 'AMAN',       en: 'SAFE'    },
  'WARNING': { id: 'PERINGATAN', en: 'WARNING' },
  'DANGER':  { id: 'BAHAYA',     en: 'DANGER'  },
  'OFFLINE': { id: 'OFFLINE',    en: 'OFFLINE' },
}

export default function DashboardPage() {
  const {
    latestReading, recentReadings, telemetryRows,
    connectionStatus, sseError, chartMetric, chartRange,
    chartData, setChartMetric, setChartRange, reconnect,
  } = useDashboard()

  const { lang } = useLang()
  const appMode  = (process.env.NEXT_PUBLIC_APP_MODE ?? 'local') as 'cloud' | 'local'

  const r         = latestReading
  const isLoading = !r && connectionStatus === 'connecting'

  const phResult      = r ? evaluatePh(r.ph)                        : null
  const tdsResult     = r ? evaluateTds(r.tds)                      : null
  const turbResult    = r ? evaluateTurbidity(r.turbidity)          : null
  const flowResult    = r ? evaluateFlow(r.flow_lpm, r.pump_status) : null
  const qualityResult = r
    ? evaluateWaterQuality(r.ph, r.tds, r.turbidity, r.flow_lpm, r.pump_status)
    : null

  const sl = (res: { label: string } | null) =>
    res ? (STATUS_LABEL_MAP[res.label]?.[lang] ?? res.label) : '—'
  const ql = (lbl: string) =>
    QUALITY_LABEL_MAP[lbl]?.[lang] ?? lbl

  // Chart data — ph from history when metric=ph, else from recent
  const phChartData = useMemo(() => {
    if (chartMetric === 'ph') return chartData
    return recentReadings
      .slice().reverse()
      .map(rr => ({
        time:  new Date(rr.received_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        ts:    new Date(rr.received_at).getTime(),
        value: rr.ph,
      }))
  }, [chartMetric, chartData, recentReadings])

  void phChartData // kept for future pH-only chart if needed

  return (
    <AppShell connectionStatus={connectionStatus} appMode={appMode}>

      {/* ── Page header ── */}
      <div className="px-4 md:px-6 pt-5 pb-3">
        <h1 className="text-base sm:text-lg font-bold text-[#15324A] leading-tight">
          {lang === 'id' ? 'FILTRAZON Monitoring Dashboard' : 'FILTRAZON Monitoring Dashboard'}
        </h1>
        <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
          {lang === 'id' ? 'Sistem Monitoring Filtrasi Air Portabel' : 'Portable Water Purification Monitoring System'}
        </p>
      </div>

      {/* ── SSE reconnect banner (no emoji) ── */}
      {sseError && (
        <div className="mx-4 md:mx-6 mb-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
          <WifiOff size={14} className="text-amber-500 shrink-0" />
          <span className="text-xs text-amber-700 font-medium flex-1">
            {lang === 'id' ? 'Koneksi terputus. Menghubungkan ulang...' : 'Connection lost. Reconnecting...'}
          </span>
          <button onClick={reconnect}
            className="text-xs font-bold text-amber-700 underline hover:no-underline min-h-[32px] px-1">
            {lang === 'id' ? 'Coba Lagi' : 'Retry'}
          </button>
        </div>
      )}

      <div className="px-4 md:px-6 pb-4 space-y-4">

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => <MetricCardSkeleton key={i} />)}
          </div>
        ) : !r ? (
          <div className="card"><EmptyState variant="no-data" /></div>
        ) : (
          <>
            {/* ── MOBILE: Water quality first ── */}
            <div className="lg:hidden">
              <WaterQualityCard
                status={qualityResult!.status}
                label={ql(qualityResult!.label)}
                message={qualityResult!.message}
                lang={lang}
                items={[
                  { label: `pH: ${sl(phResult)}`,   status: phResult!.status  },
                  { label: `TDS: ${sl(tdsResult)}`, status: tdsResult!.status },
                  { label: `${lang === 'id' ? 'Kekeruhan' : 'Turb.'}: ${sl(turbResult)}`, status: turbResult!.status },
                  { label: `${lang === 'id' ? 'Aliran' : 'Flow'}: ${sl(flowResult)}`,    status: flowResult!.status  },
                ]}
              />
            </div>

            {/* ── Metric cards: 2-col mobile → 3-col tablet → 5-col desktop ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <MetricCard
                label="pH"
                value={r.ph.toFixed(2)}
                icon={<Droplets size={26} />}
                status={phResult!.status}
                statusLabel={sl(phResult)}
                lastUpdate={formatLastUpdate(r.received_at, lang)}
                metric="ph"
                lang={lang}
              />
              <MetricCard
                label="TDS"
                value={r.tds.toFixed(0)}
                unit="ppm"
                icon={<Gauge size={26} />}
                status={tdsResult!.status}
                statusLabel={sl(tdsResult)}
                lastUpdate={formatLastUpdate(r.received_at, lang)}
                metric="tds"
                lang={lang}
              />
              <MetricCard
                label={lang === 'id' ? 'Kekeruhan' : 'Turbidity'}
                value={r.turbidity.toFixed(0)}
                unit="NTU"
                icon={<Waves size={26} />}
                status={turbResult!.status}
                statusLabel={sl(turbResult)}
                lastUpdate={formatLastUpdate(r.received_at, lang)}
                metric="turbidity"
                lang={lang}
              />
              <MetricCard
                label={lang === 'id' ? 'Laju Alir' : 'Flow Rate'}
                value={r.flow_lpm.toFixed(2)}
                unit="L/min"
                icon={<Activity size={26} />}
                status={flowResult!.status}
                statusLabel={sl(flowResult)}
                lastUpdate={formatLastUpdate(r.received_at, lang)}
                metric="flow_lpm"
                lang={lang}
              />
              <div className="col-span-2 sm:col-span-1">
                <MetricCard
                  label={lang === 'id' ? 'Total Air' : 'Total Water'}
                  value={r.total_liters.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  unit="L"
                  icon={<Container size={26} />}
                  status="safe"
                  statusLabel={lang === 'id' ? 'Terakumulasi' : 'Accumulated'}
                  lastUpdate={formatLastUpdate(r.received_at, lang)}
                  lang={lang}
                />
              </div>
            </div>

            {/* ── Status panels row ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Desktop: water quality */}
              <div className="hidden lg:block">
                <WaterQualityCard
                  status={qualityResult!.status}
                  label={ql(qualityResult!.label)}
                  message={qualityResult!.message}
                  lang={lang}
                  items={[
                    { label: `pH: ${sl(phResult)}`,   status: phResult!.status  },
                    { label: `TDS: ${sl(tdsResult)}`, status: tdsResult!.status },
                    { label: `${lang === 'id' ? 'Kekeruhan' : 'Turb.'}: ${sl(turbResult)}`, status: turbResult!.status },
                    { label: `${lang === 'id' ? 'Aliran' : 'Flow'}: ${sl(flowResult)}`,    status: flowResult!.status  },
                  ]}
                />
              </div>
              <TreatmentStatus
                pumpOn={r.pump_status}
                uvOn={r.uv_status}
                flowLpm={r.flow_lpm}
                pumpRuntime={formatUptime(r.uptime_ms)}
                uvRuntime={formatUptime(r.uptime_ms)}
                lang={lang}
              />
              <LoRaStatusCard
                rssi={r.rssi}
                snr={r.snr}
                gateway={r.gateway_id}
                packetLoss={0}
                lastPacket={formatLastUpdate(r.received_at, lang)}
                lang={lang}
              />
            </div>
          </>
        )}

        {/* ── Sensor chart — dari /api/history ── */}
        <RealtimeChart
          data={chartData}
          loading={isLoading}
          error={sseError && recentReadings.length === 0}
          metric={chartMetric}
          range={chartRange}
          onMetricChange={setChartMetric}
          onRangeChange={setChartRange}
          lang={lang}
        />

        {/* ── Recent telemetry ── */}
        <TelemetryTable rows={telemetryRows} loading={isLoading} lang={lang} />

        {/* ── Sistem Rekomendasi — paling bawah ── */}
        {r && (
          <WaterAdviceCard
            ph={r.ph}
            tds={r.tds}
            turbidity={r.turbidity}
            flowLpm={r.flow_lpm}
            pumpOn={r.pump_status}
            lang={lang}
          />
        )}
      </div>
    </AppShell>
  )
}
