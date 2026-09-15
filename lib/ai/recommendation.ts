export interface TelemetryData {
  ph?: number
  tds?: number
  turbidity?: number
  flow_lpm?: number
  pump_status?: boolean
  uv_status?: boolean
  total_liters?: number
  rssi?: number
  battery?: number
  seq?: number
  device_id?: string
}

export function generateExpertRecommendation(t: TelemetryData, userPrompt?: string, lang = 'id'): string {
  const ph = Number(t.ph ?? 7.0)
  const tds = Number(t.tds ?? 200)
  const turb = Number(t.turbidity ?? 50)
  const flow = Number(t.flow_lpm ?? 0)
  const pump = Boolean(t.pump_status)
  const uv = Boolean(t.uv_status)

  const isPhDanger = ph < 6.0 || ph > 9.0
  const isPhWarn = (ph >= 6.0 && ph < 6.5) || (ph > 8.5 && ph <= 9.0)
  const isTdsDanger = tds > 500
  const isTdsWarn = tds > 300 && tds <= 500
  const isTurbDanger = turb > 500
  const isTurbWarn = turb > 100 && turb <= 500
  const isFlowAnomaly = pump && flow <= 0.1

  const isDanger = isPhDanger || isTdsDanger || isTurbDanger || (isFlowAnomaly && flow <= 0)
  const isWarning = isPhWarn || isTdsWarn || isTurbWarn || (!uv && pump)

  const statusBadge = isDanger ? '🔴 STATUS: BAHAYA / INTERVENSI SEGERA' : isWarning ? '🟡 STATUS: PERINGATAN / PERLU PENGAWASAN' : '🟢 STATUS: AMAN / STANDAR BAKU MUTU TERPENUHI'

  let out = `### ${statusBadge}\n\n`
  out += `**Analisis Sensor Terkini (${t.device_id ?? 'FILTRAZON-01'} · Seq #${t.seq ?? 0}):**\n`

  const list: string[] = []
  if (isPhDanger) {
    list.push(`- **pH Air (${ph.toFixed(2)})**: 🔴 **Kritis** (${ph < 6.0 ? 'Terlalu Asam' : 'Terlalu Basa'}). Beresiko mengikis saluran pencernaan dan korosi pipa.`)
  } else if (isPhWarn) {
    list.push(`- **pH Air (${ph.toFixed(2)})**: 🟡 Mendekati ambang batas toleransi baku mutu (6.5–8.5).`)
  } else {
    list.push(`- **pH Air (${ph.toFixed(2)})**: 🟢 Netral dan sangat ideal (Standar WHO/Kemenkes: 6.5–8.5).`)
  }

  if (isTdsDanger) {
    list.push(`- **TDS (${tds.toFixed(0)} ppm)**: 🔴 Melebihi batas aman baku mutu (> 500 ppm). Kandungan partikel padat terlarut tinggi.`)
  } else if (isTdsWarn) {
    list.push(`- **TDS (${tds.toFixed(0)} ppm)**: 🟡 Kategori sedang (300–500 ppm). Filter karbon atau membran perlu regenerasi.`)
  } else {
    list.push(`- **TDS (${tds.toFixed(0)} ppm)**: 🟢 Sangat baik dan aman dikonsumsi (< 300 ppm).`)
  }

  if (isTurbDanger) {
    list.push(`- **Kekeruhan (${turb.toFixed(0)} NTU)**: 🔴 **Sangat Keruh** (> 500 NTU). Air mengandung partikel sedimen lumpur pekat.`)
  } else if (isTurbWarn) {
    list.push(`- **Kekeruhan (${turb.toFixed(0)} NTU)**: 🟡 Agak keruh (100–500 NTU). Memerlukan proses sedimentasi awal.`)
  } else {
    list.push(`- **Kekeruhan (${turb.toFixed(0)} NTU)**: 🟢 Jernih memenuhi standar air bersih (< 100 NTU).`)
  }

  if (isFlowAnomaly) {
    list.push(`- **Laju Alir (${flow.toFixed(2)} L/min)**: ⚠️ **Peringatan Aliran Terhambat!** Pompa ON namun debit air <= 0.1 L/min. Indikasi filter tersumbat (clogging) atau air baku kosong.`)
  } else if (pump) {
    list.push(`- **Laju Alir (${flow.toFixed(2)} L/min)**: 🟢 Aliran normal dengan pompa aktif.`)
  } else {
    list.push(`- **Laju Alir**: ⚪ Pompa dalam kondisi Standby (OFF).`)
  }

  if (pump && !uv) {
    list.push(`- **UV Sterilizer (OFF)**: ⚠️ Pompa menyala tetapi lampu UV mati! Resiko bakteri/patogen belum disterilkan.`)
  } else if (uv) {
    list.push(`- **UV Sterilizer (ON)**: 🟢 Desinfeksi ultraviolet aktif mengeliminasi bakteri dan mikroorganisme.`)
  }

  out += list.join('\n') + '\n\n'

  out += `**🛠️ Panduan Tindakan Taktis Operator:**\n`
  const actions: string[] = []

  if (isFlowAnomaly) {
    actions.push(`1. **Matikan Pompa Sejenak (R1OFF)**: Cegah overheating motor pompa akibat dry-run. Periksa selang intake dan bersihkan pre-filter sediment.`)
  }
  if (isTurbDanger || isTurbWarn) {
    actions.push(`2. **Lakukan Backwash / Penggantian Cartridge**: Bersihkan tabung media filtrasi pasir/karbon dan bersihkan sedimen filter 5 mikron.`)
  }
  if (pump && !uv) {
    actions.push(`3. **Aktifkan Relay UV (R2ON)**: Buka tab **Kontrol Relay** dan nyalakan UV Sterilizer sebelum mengalirkan air ke tandon distribusi.`)
  }
  if (isPhDanger) {
    actions.push(`4. **Koreksi pH Air**: Lakukan sirkulasi ulang melalui cartridge remineralisasi atau aerasi.`)
  }
  if (actions.length === 0) {
    actions.push(`1. Performa sistem filtrasi stabil. Lanjutkan operasional dan lakukan pencatatan berkala.`)
    actions.push(`2. Total air terfiltrasi ${t.total_liters ?? 0} L tercatat aman dalam database riwayat.`)
  }

  out += actions.join('\n') + '\n\n'

  out += `**💧 Status Kelayakan Konsumsi:**\n`
  if (isDanger) {
    out += `🚫 **TIDAK LAYAK DIMINUM LANGSUNG.** Tangguhkan pembagian air kepada masyarakat hingga perbaikan filter dan aliran selesai.`
  } else if (isWarning) {
    out += `⚠️ **DISARANKAN DIMASAK DAHULU.** Layak digunakan untuk mencuci dan sanitasi. Jika untuk diminum, wajib dimasak sampai mendidih.`
  } else {
    out += `✅ **LAYAK KONSUMSI LANGSUNG.** Air telah memenuhi standar fisik dan mikrobiologis filtrasi tanggap bencana.`
  }

  if (userPrompt) {
    out += `\n\n---\n*Tanggapan Khusus untuk Pertanyaan: "${userPrompt}"*\n`
    out += `Berdasarkan data telemetri di atas, sistem merekomendasikan prioritas penanganan pada parameter anomali sebelum meningkatkan debit pompa.`
  }

  return out
}
