// ─────────────────────────────────────────────────────────────
//  FILTRAZON — Translations (ID / EN)
// ─────────────────────────────────────────────────────────────

export type Lang = 'id' | 'en'

export const translations = {
  // ── Dashboard ──────────────────────────────────────────
  dashboard: {
    title:         { id: 'FILTRAZON Monitoring Dashboard', en: 'FILTRAZON Monitoring Dashboard' },
    subtitle:      { id: 'Sistem Monitoring Filtrasi Air Portabel', en: 'Portable Water Purification Monitoring System' },
    reconnecting:  { id: 'Koneksi realtime terputus. Menghubungkan ulang...', en: 'Realtime connection interrupted. Reconnecting...' },
    retry:         { id: 'Coba Lagi', en: 'Retry' },
    noData:        { id: 'Belum ada telemetri diterima.', en: 'No telemetry received yet.' },
  },

  // ── Metric cards ───────────────────────────────────────
  metric: {
    ph:          { id: 'pH', en: 'pH' },
    tds:         { id: 'TDS', en: 'TDS' },
    turbidity:   { id: 'Kekeruhan', en: 'Turbidity' },
    flowRate:    { id: 'Laju Alir', en: 'Flow Rate' },
    totalWater:  { id: 'Total Air', en: 'Total Water' },
    justNow:     { id: 'Baru saja', en: 'Just now' },
    accumulated: { id: 'Terakumulasi', en: 'Accumulated' },
  },

  // ── Status labels ──────────────────────────────────────
  status: {
    safe:    { id: 'Aman', en: 'Safe' },
    warning: { id: 'Peringatan', en: 'Warning' },
    danger:  { id: 'Bahaya', en: 'Danger' },
    offline: { id: 'Tidak Online', en: 'Offline' },
    normal:  { id: 'Normal', en: 'Normal' },
    high:    { id: 'Tinggi', en: 'High' },
    low:     { id: 'Rendah', en: 'Low' },
    clear:   { id: 'Jernih', en: 'Clear' },
    cloudy:  { id: 'Keruh', en: 'Cloudy' },
    noFlow:  { id: 'Tidak Mengalir', en: 'No Flow' },
    idle:    { id: 'Diam', en: 'Idle' },
    good:    { id: 'Bagus', en: 'Good' },
    weak:    { id: 'Lemah', en: 'Weak' },
    poor:    { id: 'Buruk', en: 'Poor' },
    elevated:{ id: 'Meningkat', en: 'Elevated' },
  },

  // ── Water quality card ─────────────────────────────────
  waterQuality: {
    title:    { id: 'Kualitas Air', en: 'Water Quality' },
    safe:     { id: 'AMAN', en: 'SAFE' },
    warning:  { id: 'PERINGATAN', en: 'WARNING' },
    danger:   { id: 'BAHAYA', en: 'DANGER' },
    offline:  { id: 'TIDAK ONLINE', en: 'OFFLINE' },
  },

  // ── Treatment system ───────────────────────────────────
  treatment: {
    title:      { id: 'Sistem Pengolahan', en: 'Treatment System' },
    pump:       { id: 'Pompa', en: 'Pump' },
    uv:         { id: 'UV Sterilizer', en: 'UV Sterilizer' },
    currentFlow:{ id: 'Aliran Saat Ini', en: 'Current Flow' },
    pumpRuntime:{ id: 'Waktu Pompa', en: 'Pump Runtime' },
    uvRuntime:  { id: 'Waktu UV', en: 'UV Runtime' },
    flowFailure:{ id: 'Kegagalan aliran — pompa ON tapi tidak mengalir', en: 'Flow failure detected — pump is ON but no flow' },
    uvNoFlow:   { id: 'UV aktif tanpa aliran air', en: 'UV active without water flow' },
  },

  // ── LoRa panel ─────────────────────────────────────────
  lora: {
    title:      { id: 'Koneksi LoRa', en: 'LoRa Link' },
    gateway:    { id: 'Gateway', en: 'Gateway' },
    packetLoss: { id: 'Kehilangan Paket', en: 'Packet Loss' },
    lastPacket: { id: 'Paket Terakhir', en: 'Last Packet' },
  },

  // ── Chart ──────────────────────────────────────────────
  chart: {
    title:        { id: 'Monitoring Realtime', en: 'Realtime Monitoring' },
    phChart:      { id: 'Grafik pH', en: 'pH Chart' },
    phZoneAcidic: { id: 'Asam', en: 'Acidic' },
    phZoneNeutral:{ id: 'Netral', en: 'Neutral' },
    phZoneAlkaline:{ id: 'Basa', en: 'Alkaline' },
    selectMetric: { id: 'Pilih parameter', en: 'Select metric' },
    noData:       { id: 'Belum ada data', en: 'No data yet' },
  },

  // ── Telemetry table ────────────────────────────────────
  telemetry: {
    title:     { id: 'Telemetri Terbaru', en: 'Recent Telemetry' },
    time:      { id: 'Waktu', en: 'Time' },
    seq:       { id: 'Seq', en: 'Seq' },
    packets:   { id: 'paket', en: 'packets' },
  },

  // ── Nav / sidebar ──────────────────────────────────────
  nav: {
    dashboard:   { id: 'Dashboard', en: 'Dashboard' },
    history:     { id: 'Riwayat', en: 'History' },
    devices:     { id: 'Perangkat', en: 'Devices' },
    alert:       { id: 'Alert', en: 'Alert' },
    map:         { id: 'Peta', en: 'Map' },
    settings:    { id: 'Pengaturan', en: 'Settings' },
    logout:      { id: 'Keluar', en: 'Logout' },
  },

  // ── Connection status ──────────────────────────────────
  connection: {
    live:       { id: 'LIVE', en: 'LIVE' },
    stale:      { id: 'USANG', en: 'STALE' },
    offline:    { id: 'OFFLINE', en: 'OFFLINE' },
    connecting: { id: 'MENGHUBUNGKAN', en: 'CONNECTING' },
  },

  // ── Riwayat page ───────────────────────────────────────
  history: {
    title:         { id: 'Riwayat Sensor', en: 'Sensor History' },
    subtitle:      { id: 'Data kualitas air historis', en: 'Historical water quality data' },
    from:          { id: 'Dari', en: 'From' },
    to:            { id: 'Sampai', en: 'To' },
    device:        { id: 'Perangkat', en: 'Device' },
    reset:         { id: 'Reset', en: 'Reset' },
    exportCsv:     { id: 'Ekspor CSV', en: 'Export CSV' },
    exporting:     { id: 'Mengekspor...', en: 'Exporting...' },
    refresh:       { id: 'Refresh', en: 'Refresh' },
    records:       { id: 'rekaman', en: 'records' },
    page:          { id: 'Halaman', en: 'Page' },
    avgPh:         { id: 'Rata-rata pH', en: 'Avg pH' },
    avgTds:        { id: 'Rata-rata TDS', en: 'Avg TDS' },
    avgTurbidity:  { id: 'Rata-rata Kekeruhan', en: 'Avg Turbidity' },
    avgFlow:       { id: 'Rata-rata Aliran', en: 'Avg Flow' },
    totalRecords:  { id: 'Total Rekaman', en: 'Total Records' },
  },

  // ── Alert page ─────────────────────────────────────────
  alerts: {
    title:    { id: 'Alert', en: 'Alerts' },
    subtitle: { id: 'Alert dan notifikasi sistem', en: 'System alerts and notifications' },
    critical: { id: 'Kritis', en: 'Critical' },
    warning:  { id: 'Peringatan', en: 'Warning' },
    resolved: { id: 'Terselesaikan', en: 'Resolved' },
    all:      { id: 'Semua', en: 'All' },
    active:   { id: 'Aktif', en: 'Active' },
    noAlerts: { id: 'Tidak ada alert', en: 'No alerts' },
    noMatch:  { id: 'Tidak ada alert yang sesuai filter.', en: 'No alerts match the selected filter.' },
    device:   { id: 'Perangkat', en: 'Device' },
    value:    { id: 'Nilai', en: 'Value' },
    threshold:{ id: 'Batas', en: 'Threshold' },
    resolvedAt:{ id: 'Terselesaikan', en: 'Resolved' },
  },

  // ── Common ─────────────────────────────────────────────
  common: {
    filter:  { id: 'Filter', en: 'Filter' },
    loading: { id: 'Memuat...', en: 'Loading...' },
    error:   { id: 'Terjadi kesalahan', en: 'An error occurred' },
    retry:   { id: 'Coba Lagi', en: 'Retry' },
    on:      { id: 'NYALA', en: 'ON' },
    off:     { id: 'MATI', en: 'OFF' },
    ago:     { id: 'yang lalu', en: 'ago' },
    seconds: { id: 'detik', en: 'seconds' },
    minutes: { id: 'menit', en: 'minutes' },
    justNow: { id: 'Baru saja', en: 'Just now' },
  },
} satisfies Record<string, Record<string, Record<Lang, string>>>

// Helper — get translation string
export function t(
  section: keyof typeof translations,
  key: string,
  lang: Lang,
): string {
  const sec = translations[section] as Record<string, Record<Lang, string>>
  return sec?.[key]?.[lang] ?? key
}
