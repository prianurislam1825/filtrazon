import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { generateExpertRecommendation, type TelemetryData } from '@/lib/ai/recommendation'

export async function POST(request: NextRequest): Promise<Response> {
  const authEnabled = process.env.AUTH_ENABLED !== 'false'
  const appMode = process.env.APP_MODE ?? 'local'
  if (authEnabled && appMode !== 'local') {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ ok: false, error: 'Unauthorized: Silakan login terlebih dahulu.' }, { status: 401 })
    }
  }

  const apiKey = process.env.OPENAI_API_KEY

  let body: {
    telemetry?: TelemetryData
    userPrompt?: string
    lang?: 'id' | 'en'
  } = {}

  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const latest = global.__latestReading
  const t: TelemetryData = body.telemetry ?? {
    ph: latest?.ph ?? 7.3,
    tds: latest?.tds ?? 260,
    turbidity: latest?.turbidity ?? 120,
    flow_lpm: latest?.flow_lpm ?? 0,
    pump_status: latest?.pump_status ?? false,
    uv_status: latest?.uv_status ?? false,
    total_liters: latest?.total_liters ?? 0,
    rssi: latest?.rssi ?? -40,
    device_id: latest?.device_id ?? 'FILTRAZON-01',
    seq: latest?.seq ?? 0,
  }

  const lang = body.lang ?? 'id'
  const userPrompt = body.userPrompt?.trim()

  // ── 1. Coba panggil OpenAI GPT-4o-mini jika API key tersedia ──
  if (apiKey) {
    const systemPrompt = `Anda adalah FILTRAZON AI Advisor — asisten pakar teknik lingkungan, kimia air, dan sistem purifikasi air minum portabel IoT bertenaga surya untuk tanggap darurat bencana (FILTRAZON).

Basis Riset & Standar Internasional/Nasional yang Wajib Dirujuk:
1. Permenkes RI No. 2 Tahun 2023 (Standar Baku Mutu Kesehatan Lingkungan untuk Media Air Minum).
2. WHO Guidelines for Drinking-water Quality (4th Edition, 2022).
3. The Sphere Project: Humanitarian Charter and Minimum Standards in Disaster Response (WASH Chapter: 15 L/jiwa/hari, jarak < 500m, kekeruhan < 5 NTU).
4. US EPA Drinking Water Regulations & NSF/ANSI Standard 55 (UV-C 254nm dosis >= 40 mJ/cm2).

Parameter Baku Mutu:
- pH: 6.50 – 8.50 (Asam: korosif; Basa: pahit & kerak kalsium).
- TDS: <= 300 ppm (Ideal), 300 – 500 ppm (Batas Wajar), > 500 ppm (Tinggi/Payau, wajib RO).
- Kekeruhan: <= 1.0 – 5.0 NTU (Air Minum), 5 – 25 NTU (Darurat Bencana), > 100 NTU (Banjir, butuh pengendapan & backwash).
- Flow Rate: Jika Pompa ON & Flow <= 0.1 L/min -> Clogging/dry-run!
- UV Sterilizer: Wajib ON saat pompa mengalirkan air minum untuk eradikasi E. Coli & kista patogen.

Tugas Anda:
Jawab setiap pertanyaan pengguna secara komprehensif, ilmiah, berbasis data riset, dan korelasikan langsung dengan data telemetri sensor saat ini. Berikan langkah taktis operasional yang dapat langsung diaplikasikan oleh admin/operator lapangan.

Gunakan bahasa ${lang === 'id' ? 'Indonesia' : 'English'} dengan format Markdown rapi dan terstruktur.`

    const telemetryContext = `Data Telemetri Sensor Terkini (${t.device_id ?? 'FILTRAZON-01'} - Seq #${t.seq ?? 0}):
- pH Air: ${t.ph ?? 'N/A'}
- TDS: ${t.tds ?? 'N/A'} ppm
- Kekeruhan (Turbidity): ${t.turbidity ?? 'N/A'} NTU
- Laju Alir (Flow Rate): ${t.flow_lpm ?? 'N/A'} L/min
- Total Air Terfiltrasi: ${t.total_liters ?? 'N/A'} Liter
- Status Pompa: ${t.pump_status ? 'ON (Menyala)' : 'OFF (Mati)'}
- Status UV Sterilizer: ${t.uv_status ? 'ON (Aktif)' : 'OFF (Tidak Aktif)'}
- Sinyal LoRa (RSSI): ${t.rssi ?? 'N/A'} dBm`

    const userMessage = userPrompt
      ? `${telemetryContext}\n\nPertanyaan Khusus Admin/Operator:\n"${userPrompt}"\n\nBerikan analisis mendalam, rujukan standar riset, dan rekomendasi berbasis data sensor di atas.`
      : `${telemetryContext}\n\nBerikan analisis kelayakan air komprehensif, evaluasi anomali sensor/hardware, langkah taktis operasional, dan saran keselamatan konsumsi.`

    try {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.3,
          max_tokens: 1200,
        }),
        signal: AbortSignal.timeout(12000),
      })

      if (openaiRes.ok) {
        const data = await openaiRes.json()
        const content = data.choices?.[0]?.message?.content
        if (content) {
          return Response.json({
            ok: true,
            recommendation: content,
            telemetry: t,
            timestamp: new Date().toISOString(),
            model: data.model ?? 'gpt-4o-mini',
            source: 'openai',
          })
        }
      }
    } catch {}
  }

  // ── 2. Fallback cerdas berbasis riset ilmiah & NLP keyword search ─────
  const expertText = generateExpertRecommendation(t, userPrompt, lang)
  return Response.json({
    ok: true,
    recommendation: expertText,
    telemetry: t,
    timestamp: new Date().toISOString(),
    model: 'FILTRAZON Research-Backed AI Engine',
    source: 'expert-fallback',
    quotaNotice: apiKey ? 'OpenAI API key terpasang di sistem. Saat kuota akun aktif, sistem akan otomatis memanfaatkan GPT-4o-mini.' : null,
  })
}
