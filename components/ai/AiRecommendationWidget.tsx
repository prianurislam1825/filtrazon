'use client'

import { useState, useEffect, useRef } from 'react'
import Draggable from 'react-draggable'
import {
  Sparkles, X, Send, Bot, RefreshCw, AlertTriangle,
  CheckCircle2, Droplets, Gauge, Waves, Activity,
  Copy, Check, MessageSquare, BookOpen, ChevronRight
} from 'lucide-react'
import { useLang } from '@/lib/i18n/context'

interface QuickPromptItem {
  category: { id: string; en: string }
  label: { id: string; en: string }
  q: { id: string; en: string }
}

const QUICK_PROMPTS: QuickPromptItem[] = [
  {
    category: { id: 'Baku Mutu', en: 'Water Quality' },
    label:    { id: '📜 Standar WHO & Permenkes', en: '📜 WHO & Ministry Standards' },
    q: {
      id: 'Bagaimana standar baku mutu air minum menurut Permenkes No. 2 Tahun 2023 dan WHO, dan apakah air saat ini layak konsumsi?',
      en: 'What are the drinking water quality standards according to WHO and local regulations, and is the current water safe for consumption?'
    }
  },
  {
    category: { id: 'Kekeruhan', en: 'Turbidity' },
    label:    { id: '🌊 Penanganan Air Banjir / Keruh', en: '🌊 Flood / Turbid Water Treatment' },
    q: {
      id: 'Kekeruhan air sangat tinggi. Apa penyebab partikel suspensi dan bagaimana tahapan klarifikasi air keruh/banjir?',
      en: 'Water turbidity is very high. What causes suspended particles and what are the steps to clarify turbid/flood water?'
    }
  },
  {
    category: { id: 'TDS & Garam', en: 'TDS & Salt' },
    label:    { id: '🧂 Solusi TDS & Rasa Asin', en: '🧂 TDS & Salinity Solution' },
    q: {
      id: 'Mengapa nilai TDS tinggi dan bagaimana cara mereduksi partikel garam terlarut dalam air payau?',
      en: 'Why is TDS high and how to reduce dissolved salt particles in brackish water?'
    }
  },
  {
    category: { id: 'UV & Bakteri', en: 'UV & Bacteria' },
    label:    { id: '🛡️ Sterilisasi UV & E. Coli', en: '🛡️ UV Sterilization & E. Coli' },
    q: {
      id: 'Berapa standar dosis sinar UV 254nm untuk membunuh bakteri E. Coli dan patogen diare?',
      en: 'What is the standard UV 254nm dose to kill E. Coli bacteria and diarrhea pathogens?'
    }
  },
  {
    category: { id: 'Maintenance', en: 'Maintenance' },
    label:    { id: '🔧 Cara Backwash & Cuci Filter', en: '🔧 Backwash & Filter Cleaning' },
    q: {
      id: 'Bagaimana prosedur backwashing tabung filter FRP dan jadwal penggantian cartridge sedimen serta karbon aktif?',
      en: 'What is the FRP filter backwash procedure and sediment/activated carbon cartridge replacement schedule?'
    }
  },
  {
    category: { id: 'Tenaga Surya', en: 'Solar Power' },
    label:    { id: '⚡ Tenaga Surya & Baterai', en: '⚡ Solar Power & Battery' },
    q: {
      id: 'Bagaimana efisiensi sistem solar panel MPPT dan berapa lama baterai LiFePO4 mampu menggerakkan pompa saat mendung/malam?',
      en: 'How efficient is the MPPT solar panel system and how long can a LiFePO4 battery power the pump during cloudy/night conditions?'
    }
  },
  {
    category: { id: 'SOP Bencana', en: 'Disaster SOP' },
    label:    { id: '🚨 Standar WASH Pengungsi', en: '🚨 Refugee WASH Standards' },
    q: {
      id: 'Berapa jatah air minimal per orang per hari di posko pengungsian menurut standar The Sphere Project?',
      en: 'What is the minimum water allocation per person per day at a refugee shelter according to The Sphere Project standards?'
    }
  },
  {
    category: { id: 'Pompa & Relay', en: 'Pump & Relay' },
    label:    { id: '⚙️ Troubleshooting Pompa & Relay', en: '⚙️ Pump & Relay Troubleshooting' },
    q: {
      id: 'Mengapa pompa relay 5V kadang tidak mau mati saat di-OFF pada ESP32 3.3V dan bagaimana cara mengatasinya?',
      en: 'Why does a 5V relay pump sometimes not turn off when commanded OFF on ESP32 3.3V and how to fix it?'
    }
  },
]

export default function AiRecommendationWidget() {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastQuestion, setLastQuestion] = useState<string | null>(null)
  const [recommendation, setRecommendation] = useState<string | null>(null)
  const [model, setModel] = useState<string>('FILTRAZON Research Engine')
  const [quotaNotice, setQuotaNotice] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [copied, setCopied] = useState(false)
  const [telemetry, setTelemetry] = useState<Record<string, unknown> | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [hidden, setHidden] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)

  const T = {
    showAI:        { id: 'Munculkan AI',              en: 'Show AI' },
    hideAI:        { id: 'Sembunyikan AI',             en: 'Hide AI' },
    openAdvisor:   { id: 'Buka AI Advisor',            en: 'Open AI Advisor' },
    subtitle:      { id: 'Riset Ilmiah, Analisis Telemetri & Panduan Taktis', en: 'Scientific Research, Telemetry Analysis & Tactical Guidance' },
    reanalyze:     { id: 'Analisis Ulang Telemetri',  en: 'Re-analyze Telemetry' },
    close:         { id: 'Tutup',                     en: 'Close' },
    turbidity:     { id: 'Keruh',                     en: 'Turb' },
    pump:          { id: 'Pompa',                     en: 'Pump' },
    searching:     { id: 'Menelusuri Basis Data Riset Ilmiah...', en: 'Searching Scientific Research Database...' },
    correlating:   { id: 'Mengkorelasikan WHO, Permenkes, dan parameter sensor telemetri', en: 'Correlating WHO standards, regulations, and sensor telemetry parameters' },
    verified:      { id: 'Analisis Riset Terverifikasi', en: 'Verified Research Analysis' },
    copied:        { id: 'Tersalin',                  en: 'Copied' },
    copy:          { id: 'Salin Laporan',             en: 'Copy Report' },
    you:           { id: 'Anda',                      en: 'You' },
    pickTopic:     { id: 'Pilih topik riset di atas atau ajukan pertanyaan khusus.', en: 'Choose a research topic above or ask a custom question.' },
    example:       { id: 'Contoh: "Bagaimana standar baku mutu WHO?", "Cara cuci filter mampet", atau "Dosis sterilisasi UV".', en: 'Example: "What are WHO water quality standards?", "How to backwash a clogged filter", or "UV sterilization dose".' },
    placeholder:   { id: 'Ketik pertanyaan untuk diteliti (misal: standar WHO, cara backwash, dosis UV)...', en: 'Type a question to research (e.g. WHO standards, backwash procedure, UV dose)...' },
    send:          { id: 'Kirim Pertanyaan',          en: 'Send Question' },
    errFetch:      { id: 'Gagal memuat rekomendasi AI.', en: 'Failed to load AI recommendation.' },
    errNetwork:    { id: 'Terjadi kendala saat menghubungi modul rekomendasi AI.', en: 'An error occurred while contacting the AI recommendation module.' },
    research:      { id: 'Riset',                     en: 'Research' },
    allCategory:   { id: 'Semua',                     en: 'All' },
  }

  const categoryList = [
    { key: 'all',         label: { id: 'Semua',        en: 'All'          } },
    { key: 'Baku Mutu',   label: { id: 'Baku Mutu',    en: 'Water Quality' } },
    { key: 'Kekeruhan',   label: { id: 'Kekeruhan',    en: 'Turbidity'    } },
    { key: 'TDS & Garam', label: { id: 'TDS & Garam',  en: 'TDS & Salt'   } },
    { key: 'UV & Bakteri',label: { id: 'UV & Bakteri', en: 'UV & Bacteria' } },
    { key: 'Maintenance', label: { id: 'Maintenance',  en: 'Maintenance'  } },
    { key: 'Tenaga Surya',label: { id: 'Tenaga Surya', en: 'Solar Power'  } },
    { key: 'SOP Bencana', label: { id: 'SOP Bencana',  en: 'Disaster SOP' } },
    { key: 'Pompa & Relay',label:{ id: 'Pompa & Relay',en: 'Pump & Relay' } },
  ]

  // Fetch AI recommendation
  async function fetchRecommendation(customPrompt?: string) {
    setLoading(true)
    setLastQuestion(customPrompt || null)
    try {
      const res = await fetch('/api/ai-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: customPrompt,
          lang: lang,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setRecommendation(data.recommendation)
        setModel(data.model ?? 'FILTRAZON Research Engine')
        setQuotaNotice(data.quotaNotice ?? null)
        setTelemetry(data.telemetry ?? null)
      } else {
        setRecommendation(`⚠️ ${data.error ?? T.errFetch[lang]}`)
      }
    } catch {
      setRecommendation(`⚠️ ${T.errNetwork[lang]}`)
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

  const filteredPrompts = selectedCategory === 'all'
    ? QUICK_PROMPTS
    : QUICK_PROMPTS.filter(p => p.category.id === selectedCategory)

  if (hidden) {
    return (
      <div className="fixed bottom-20 lg:bottom-6 right-0 z-40 animate-in slide-in-from-right-4">
        <button
          onClick={() => setHidden(false)}
          title={T.showAI[lang]}
          className="bg-sky-600/50 hover:bg-sky-600 text-white p-2 rounded-l-xl shadow-md border border-r-0 border-sky-400/30 backdrop-blur-md transition-all"
        >
          <Bot size={20} />
        </button>
      </div>
    )
  }

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
        <div className="relative group">
          {/* Close / Hide Button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setHidden(true); }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center transition-opacity z-50 shadow-md hover:bg-red-600"
            title={T.hideAI[lang]}
          >
            <X size={12} />
          </button>
          <button
            onClick={() => setOpen(prev => !prev)}
            aria-label={T.openAdvisor[lang]}
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 pb-[85px] sm:pb-0 pointer-events-none">
          {/* Backdrop for mobile */}
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm sm:hidden pointer-events-auto"
            style={{ zIndex: -1 }}
          />
          <Draggable handle=".ai-handle" cancel="button" nodeRef={windowRef}>
            <div ref={windowRef} className="relative pointer-events-auto w-[94vw] sm:w-[520px] max-h-[75vh] sm:max-h-[600px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
              {/* Window Header */}
              <div style={{ touchAction: 'none' }} className="ai-handle cursor-move px-4 py-3 bg-gradient-to-r from-[#1268A5] via-[#1A4F7C] to-[#15324A] text-white flex items-center justify-between shrink-0 shadow-sm">
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
                  <p className="text-[10px] text-sky-200/80 mt-0.5">{T.subtitle[lang]}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => fetchRecommendation()}
                  title={T.reanalyze[lang]}
                  disabled={loading}
                  className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  title={T.close[lang]}
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
                  <Waves size={12} className="text-teal-600" /> {T.turbidity[lang]}: <strong>{String(telemetry.turbidity)} NTU</strong>
                </span>
                <span className="flex items-center gap-1 font-semibold text-gray-700 whitespace-nowrap">
                  <Activity size={12} className="text-emerald-600" /> {T.pump[lang]}: <strong>{telemetry.pump_status ? 'ON' : 'OFF'}</strong>
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
                  <BookOpen size={10} /> {T.research[lang]}:
                </span>
                {categoryList.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-2 py-0.5 rounded-full whitespace-nowrap font-medium transition-all ${
                      selectedCategory === cat.key
                        ? 'bg-[#1268A5] text-white shadow-xs'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/70'
                    }`}
                  >
                    {cat.label[lang]}
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
                    onClick={() => fetchRecommendation(item.q[lang])}
                    disabled={loading}
                    className="group text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 hover:text-[#1268A5] hover:border-sky-200 border border-gray-200 text-gray-700 transition-all text-left flex items-center gap-1 shadow-2xs disabled:opacity-50"
                  >
                    <span>{item.label[lang]}</span>
                    <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-sky-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Output Scroll Area */}
            <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FCFDFE] text-xs text-gray-700 leading-relaxed min-h-[260px]">
              {lastQuestion && (
                <div className="flex flex-col items-end mb-4 border-b border-gray-100 pb-4">
                  <span className="text-[9px] text-gray-400 mb-1 font-semibold pr-1">{T.you[lang]}</span>
                  <div className="bg-sky-50 border border-sky-100 text-[#15324A] px-3 py-2 rounded-2xl rounded-tr-sm text-xs max-w-[85%] shadow-sm">
                    {lastQuestion}
                  </div>
                </div>
              )}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#1268A5] animate-pulse shadow-sm">
                    <Sparkles size={20} className="animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{T.searching[lang]}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{T.correlating[lang]}</p>
                  </div>
                </div>
              ) : recommendation ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pb-1.5 border-b border-gray-100">
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 size={11} className="text-emerald-500" /> {T.verified[lang]}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors font-medium"
                    >
                      {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      {copied ? T.copied[lang] : T.copy[lang]}
                    </button>
                  </div>
                  <div className="flex flex-col items-start mt-2">
                    <span className="text-[9px] text-gray-400 mb-1 font-semibold pl-1 flex items-center gap-1">
                      <Bot size={10} className="text-sky-500" /> FILTRAZON AI
                    </span>
                    <div className="bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl rounded-tl-sm text-xs w-full shadow-sm">
                      <div className="prose prose-xs max-w-none prose-headings:font-bold prose-headings:text-[#15324A] prose-strong:text-gray-900 prose-table:my-2 prose-th:bg-gray-50 prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1 prose-td:border prose-th:border whitespace-pre-line leading-relaxed">
                        {recommendation}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-10 text-center text-gray-400 space-y-2">
                  <MessageSquare size={26} className="text-gray-300" />
                  <p className="text-xs font-semibold text-gray-600">{T.pickTopic[lang]}</p>
                  <p className="text-[11px] text-gray-400 max-w-xs">{T.example[lang]}</p>
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
                  placeholder={T.placeholder[lang]}
                  disabled={loading}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5BBCEB] focus:border-transparent transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  aria-label={T.send[lang]}
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
