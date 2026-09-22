'use client'

import { useState, useEffect, useRef } from 'react'
import Draggable from 'react-draggable'
import {
  Sparkles, X, Send, Bot, RefreshCw, AlertTriangle,
  CheckCircle2, Droplets, Gauge, Waves, Activity,
  Copy, Check, MessageSquare, BookOpen, ChevronRight
} from 'lucide-react'

interface QuickPromptItem {
  category: string
  label: string
  q: string
}

const QUICK_PROMPTS: QuickPromptItem[] = [
  { category: 'Baku Mutu', label: '📜 Standar WHO & Permenkes', q: 'Bagaimana standar baku mutu air minum menurut Permenkes No. 2 Tahun 2023 dan WHO, dan apakah air saat ini layak konsumsi?' },
  { category: 'Kekeruhan', label: '🌊 Penanganan Air Banjir / Keruh', q: 'Kekeruhan air sangat tinggi. Apa penyebab partikel suspensi dan bagaimana tahapan klarifikasi air keruh/banjir?' },
  { category: 'TDS & Garam', label: '🧂 Solusi TDS & Rasa Asin', q: 'Mengapa nilai TDS tinggi dan bagaimana cara mereduksi partikel garam terlarut dalam air payau?' },
  { category: 'UV & Bakteri', label: '🛡️ Sterilisasi UV & E. Coli', q: 'Berapa standar dosis sinar UV 254nm untuk membunuh bakteri E. Coli dan patogen diare?' },
  { category: 'Maintenance', label: '🔧 Cara Backwash & Cuci Filter', q: 'Bagaimana prosedur backwashing tabung filter FRP dan jadwal penggantian cartridge sedimen serta karbon aktif?' },
  { category: 'Tenaga Surya', label: '⚡ Tenaga Surya & Baterai', q: 'Bagaimana efisiensi sistem solar panel MPPT dan berapa lama baterai LiFePO4 mampu menggerakkan pompa saat mendung/malam?' },
  { category: 'SOP Bencana', label: '🚨 Standar WASH Pengungsi', q: 'Berapa jatah air minimal per orang per hari di posko pengungsian menurut standar The Sphere Project?' },
  { category: 'Pompa & Relay', label: '⚙️ Troubleshooting Pompa & Relay', q: 'Mengapa pompa relay 5V kadang tidak mau mati saat di-OFF pada ESP32 3.3V dan bagaimana cara mengatasinya?' },
]

export default function AiRecommendationWidget() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<string | null>(null)
  const [model, setModel] = useState<string>('FILTRAZON Research Engine')
  const [quotaNotice, setQuotaNotice] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [copied, setCopied] = useState(false)
  const [telemetry, setTelemetry] = useState<Record<string, unknown> | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua')
  const [hidden, setHidden] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)


  // Fetch AI recommendation
  async function fetchRecommendation(customPrompt?: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/ai-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: customPrompt,
          lang: 'id',
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setRecommendation(data.recommendation)
        setModel(data.model ?? 'FILTRAZON Research Engine')
        setQuotaNotice(data.quotaNotice ?? null)
        setTelemetry(data.telemetry ?? null)
      } else {
        setRecommendation(`⚠️ ${data.error ?? 'Gagal memuat rekomendasi AI.'}`)
      }
    } catch {
      setRecommendation('⚠️ Terjadi kendala saat menghubungi modul rekomendasi AI.')
    } finally {
      setLoading(false)
      setTimeout(() => {
        chatScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    }
  }

  // Listen for open-ai-advisor custom event
  useEffect(() => {
    function handleOpenEvent() {
      setOpen(true)
    }
    window.addEventListener('open-ai-advisor', handleOpenEvent)
    return () => window.removeEventListener('open-ai-advisor', handleOpenEvent)
  }, [])

  // Initial fetch when opened for the first time
  useEffect(() => {
    if (open && !recommendation && !loading) {
      fetchRecommendation()
    }
  }, [open, recommendation, loading])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || loading) return
    const q = prompt.trim()
    setPrompt('')
    fetchRecommendation(q)
  }

  function handleCopy() {
    if (!recommendation) return
    navigator.clipboard.writeText(recommendation)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const categories = ['Semua', 'Baku Mutu', 'Kekeruhan', 'TDS & Garam', 'UV & Bakteri', 'Maintenance', 'Tenaga Surya', 'SOP Bencana', 'Pompa & Relay']

  const filteredPrompts = selectedCategory === 'Semua'
    ? QUICK_PROMPTS
    : QUICK_PROMPTS.filter(p => p.category === selectedCategory)
  if (hidden) return null

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
        <div className="relative group">
          {/* Close / Hide Button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setHidden(true); }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center transition-opacity z-50 shadow-md hover:bg-red-600"
            title="Sembunyikan AI"
          >
            <X size={12} />
          </button>
          <button
            onClick={() => setOpen(prev => !prev)}
            aria-label="Buka AI Advisor"
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#1268A5] via-[#2185D0] to-[#5BBCEB] text-white shadow-xl shadow-sky-500/25 hover:shadow-2xl hover:shadow-sky-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
          >
            {/* Glowing pulse ring */}
            <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 opacity-75 blur-sm group-hover:opacity-100 animate-pulse -z-10" />

            <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles size={14} className="text-yellow-200 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <span className="text-xs font-bold tracking-wide flex items-center gap-1.5">
              AI Water Advisor
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded-full bg-white/20 text-white border border-white/30">
                Research
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* ── AI Recommendation Widget Window ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 pointer-events-none">
          {/* Backdrop for mobile */}
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm sm:hidden pointer-events-auto"
            style={{ zIndex: -1 }}
          />
          <Draggable handle=".ai-handle" cancel="button" nodeRef={windowRef}>
            <div ref={windowRef} className="relative pointer-events-auto w-full sm:w-[520px] max-h-[75vh] sm:max-h-[600px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
              {/* Window Header */}
              <div className="ai-handle cursor-move px-4 py-3 bg-gradient-to-r from-[#1268A5] via-[#1A4F7C] to-[#15324A] text-white flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shadow-xs">
                  <Bot size={18} className="text-sky-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold leading-none">FILTRAZON AI Water Advisor</h3>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-200 border border-sky-300/20">
                      WHO · Permenkes · IoT
                    </span>
                  </div>
                  <p className="text-[10px] text-sky-200/80 mt-0.5">Riset Ilmiah, Analisis Telemetri & Panduan Taktis</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => fetchRecommendation()}
                  title="Analisis Ulang Telemetri"
                  disabled={loading}
                  className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  title="Tutup"
                  className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Live Sensor Strip */}
            {telemetry && (
              <div className="px-4 py-2 bg-gradient-to-r from-sky-50 to-indigo-50/50 border-b border-sky-100 flex items-center justify-between gap-2 overflow-x-auto text-[10px] text-gray-600 shrink-0">
                <span className="flex items-center gap-1 font-semibold text-gray-700 whitespace-nowrap">
                  <Droplets size={12} className="text-sky-600" /> pH: <strong>{String(telemetry.ph)}</strong>
                </span>
                <span className="flex items-center gap-1 font-semibold text-gray-700 whitespace-nowrap">
                  <Gauge size={12} className="text-indigo-600" /> TDS: <strong>{String(telemetry.tds)} ppm</strong>
                </span>
                <span className="flex items-center gap-1 font-semibold text-gray-700 whitespace-nowrap">
                  <Waves size={12} className="text-teal-600" /> Keruh: <strong>{String(telemetry.turbidity)} NTU</strong>
                </span>
                <span className="flex items-center gap-1 font-semibold text-gray-700 whitespace-nowrap">
                  <Activity size={12} className="text-emerald-600" /> Pompa: <strong>{telemetry.pump_status ? 'ON' : 'OFF'}</strong>
                </span>
                <span className="flex items-center gap-1 font-semibold text-gray-700 whitespace-nowrap">
                  UV: <strong>{telemetry.uv_status ? 'ON' : 'OFF'}</strong>
                </span>
              </div>
            )}

            {/* Quota Notice if applicable */}
            {quotaNotice && (
              <div className="px-3.5 py-1.5 bg-amber-50 border-b border-amber-200/60 text-[10px] text-amber-800 flex items-center gap-2 shrink-0">
                <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                <span className="leading-tight">{quotaNotice}</span>
              </div>
            )}

            {/* Category Filter Tabs */}
            <div className="px-3 pt-2.5 pb-1 border-b border-gray-100 bg-gray-50/70 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-[10px]">
                <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
                  <BookOpen size={10} /> Riset:
                </span>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-full whitespace-nowrap font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#1268A5] text-white shadow-xs'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/70'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/40 shrink-0 max-h-[110px] overflow-y-auto">
              <div className="flex flex-wrap gap-1.5">
                {filteredPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => fetchRecommendation(item.q)}
                    disabled={loading}
                    className="group text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 hover:text-[#1268A5] hover:border-sky-200 border border-gray-200 text-gray-700 transition-all text-left flex items-center gap-1 shadow-2xs disabled:opacity-50"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-sky-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Output Scroll Area */}
            <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FCFDFE] text-xs text-gray-700 leading-relaxed min-h-[260px]">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center text-gray-400 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#1268A5] animate-pulse shadow-sm">
                    <Sparkles size={20} className="animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Menelusuri Basis Data Riset Ilmiah...</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Mengkorelasikan WHO, Permenkes, dan parameter sensor telemetri</p>
                  </div>
                </div>
              ) : recommendation ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pb-1.5 border-b border-gray-100">
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 size={11} className="text-emerald-500" /> Analisis Riset Terverifikasi
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors font-medium"
                    >
                      {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      {copied ? 'Tersalin' : 'Salin Laporan'}
                    </button>
                  </div>
                  <div className="prose prose-xs max-w-none prose-headings:font-bold prose-headings:text-[#15324A] prose-strong:text-gray-900 prose-table:my-2 prose-th:bg-gray-50 prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1 prose-td:border prose-th:border whitespace-pre-line leading-relaxed">
                    {recommendation}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-10 text-center text-gray-400 space-y-2">
                  <MessageSquare size={26} className="text-gray-300" />
                  <p className="text-xs font-semibold text-gray-600">Pilih topik riset di atas atau ajukan pertanyaan khusus.</p>
                  <p className="text-[11px] text-gray-400 max-w-xs">Contoh: "Bagaimana standar baku mutu WHO?", "Cara cuci filter mampet", atau "Dosis sterilisasi UV".</p>
                </div>
              )}
            </div>

            {/* Custom Question Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ketik pertanyaan untuk diteliti (misal: standar WHO, cara backwash, dosis UV)..."
                  disabled={loading}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5BBCEB] focus:border-transparent transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  aria-label="Kirim Pertanyaan"
                  className="w-9 h-9 rounded-xl bg-[#1268A5] hover:bg-[#0E5486] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
            </div>
          </Draggable>
        </div>
      )}
    </>
  )
}
