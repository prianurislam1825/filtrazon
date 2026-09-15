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
    const systemPrompt = `Anda adalah FILTRAZON AI Advisor — asisten pakar teknik lingkungan dan sistem purifikasi air minum portabel IoT tanggap darurat bencana (FILTRAZON).
Analisis telemetri sensor dan status hardware secara komprehensif, ilmiah, dan berikan langkah taktis operasional yang dapat langsung diaplikasikan oleh admin/operator di lapangan.

Standar Baku Mutu:
- pH normal: 6.5 - 8.5 (Kritis: < 6.0 atau > 9.0)
- TDS: <= 300 ppm (Aman), 300 - 500 ppm (Waspada), > 500 ppm (Bahaya)
- Turbidity: <= 5 NTU (Air minum murni), 5 - 100 NTU (Air bersih darurat), > 100 NTU (Keruh tinggi), > 500 NTU (Bahaya)
- Flow Rate: Jika Pompa ON dan Flow <= 0.1 L/min (Anomali pipa/filter clogging). Normal > 0.5 L/min.
- UV Sterilizer: Mematikan bakteri patogen. Wajib ON saat pompa mengalirkan air minum.

Gunakan bahasa ${lang === 'id' ? 'Indonesia' : 'English'} dengan format Markdown rapi.`

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
      ? `${telemetryContext}\n\nPertanyaan Khusus Admin/Operator:\n${userPrompt}\n\nBerikan analisis mendalam dan rekomendasi berbasis data sensor di atas.`
      : `${telemetryContext}\n\nBerikan analisis kelayakan air, evaluasi anomali sensor/hardware, langkah taktis operasional, dan saran keselamatan konsumsi.`

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
          temperature: 0.4,
          max_tokens: 1000,
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

  // ── 2. Fallback cerdas jika OpenAI error / kuota habis ─────
  const expertText = generateExpertRecommendation(t, userPrompt, lang)
  return Response.json({
    ok: true,
    recommendation: expertText,
    telemetry: t,
    timestamp: new Date().toISOString(),
    model: 'FILTRAZON AI Expert Engine (Built-in)',
    source: 'expert-fallback',
    quotaNotice: 'OpenAI API key terpasang di sistem. Saat saldo akun diisi di platform.openai.com, sistem akan otomatis beralih ke model GPT-4o-mini.',
  })
}
