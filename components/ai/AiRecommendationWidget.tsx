'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Sparkles, X, Send, Bot, RefreshCw, AlertTriangle,
  CheckCircle2, ShieldAlert, Droplets, Gauge, Waves, Activity,
  ChevronDown, Copy, Check, MessageSquare
} from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function AiRecommendationWidget() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<string | null>(null)
  const [model, setModel] = useState<string>('gpt-4o-mini')
  const [source, setSource] = useState<string>('openai')
  const [quotaNotice, setQuotaNotice] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [copied, setCopied] = useState(false)
  const [telemetry, setTelemetry] = useState<Record<string, unknown> | null>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

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
        setModel(data.model ?? 'gpt-4o-mini')
        setSource(data.source ?? 'openai')
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

  const QUICK_PROMPTS = [
    { label: '🧪 Kelayakan Air', q: 'Analisis menyeluruh apakah air ini layak minum atau hanya untuk sanitasi?' },
    { label: '⚠️ Diagnosa Kekeruhan', q: 'Kekeruhan air sangat tinggi. Apa penyebabnya dan bagaimana penanganannya?' },
    { label: '⚙️ Optimasi Pompa & UV', q: 'Bagaimana pengaturan status pompa dan UV yang paling tepat saat ini?' },
    { label: '🚨 SOP Tanggap Bencana', q: 'Berikan panduan darurat untuk distribusi air di posko pengungsian bencana.' },
  ]

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
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
            AI Advisor
            <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded-full bg-white/20 text-white border border-white/30">
              GPT
            </span>
          </span>
        </button>
      </div>

      {/* ── AI Recommendation Widget Window ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 pointer-events-none">
          {/* Backdrop for mobile */}
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs sm:hidden pointer-events-auto"
          />

          <div className="pointer-events-auto w-full sm:w-[460px] max-h-[85vh] sm:max-h-[720px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Window Header */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-[#1268A5] to-[#1E3A5F] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shadow-xs">
                  <Bot size={18} className="text-sky-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold leading-none">FILTRAZON AI Advisor</h3>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-200 border border-sky-300/20">
                      {model.includes('gpt') ? 'GPT-4o Mini' : 'Expert AI'}
                    </span>
                  </div>
                  <p className="text-[10px] text-sky-200/80 mt-0.5">Analisis Cerdas Mutu Air & Rekomendasi Taktis</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => fetchRecommendation()}
                  title="Analisis Ulang"
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
              <div className="px-4 py-2 bg-sky-50/60 border-b border-sky-100 flex items-center justify-between gap-2 overflow-x-auto text-[10px] text-gray-600 shrink-0">
                <span className="flex items-center gap-1 font-semibold text-gray-700">
                  <Droplets size={12} className="text-sky-600" /> pH: <strong>{String(telemetry.ph)}</strong>
                </span>
                <span className="flex items-center gap-1 font-semibold text-gray-700">
                  <Gauge size={12} className="text-indigo-600" /> TDS: <strong>{String(telemetry.tds)}</strong>
                </span>
                <span className="flex items-center gap-1 font-semibold text-gray-700">
                  <Waves size={12} className="text-teal-600" /> Keruh: <strong>{String(telemetry.turbidity)}</strong>
                </span>
                <span className="flex items-center gap-1 font-semibold text-gray-700">
                  <Activity size={12} className="text-emerald-600" /> Pompa: <strong>{telemetry.pump_status ? 'ON' : 'OFF'}</strong>
                </span>
              </div>
            )}

            {/* Quota Notice if applicable */}
            {quotaNotice && (
              <div className="px-3.5 py-2 bg-amber-50 border-b border-amber-200/60 text-[10px] text-amber-800 flex items-center gap-2 shrink-0">
                <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                <span className="leading-tight">{quotaNotice}</span>
              </div>
            )}

            {/* Quick Prompt Chips */}
            <div className="p-3 border-b border-gray-100 bg-gray-50/40 shrink-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pertanyaan Cepat:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => fetchRecommendation(item.q)}
                    disabled={loading}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-gray-200/70 text-gray-600 transition-all text-left disabled:opacity-50"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Output Scroll Area */}
            <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FCFDFE] text-xs text-gray-700 leading-relaxed min-h-[220px]">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center text-gray-400 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 animate-pulse">
                    <Sparkles size={20} className="animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700">AI Sedang Menganalisis Telemetri...</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Memproses pH, TDS, kekeruhan, dan parameter relay</p>
                  </div>
                </div>
              ) : recommendation ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pb-1 border-b border-gray-100">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-500" /> Analisis AI Selesai
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 hover:text-gray-600 transition-colors"
                    >
                      {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      {copied ? 'Tersalin' : 'Salin Teks'}
                    </button>
                  </div>
                  <div className="prose prose-xs max-w-none prose-headings:font-bold prose-headings:text-[#15324A] prose-strong:text-gray-800 prose-ul:my-1 prose-li:my-0.5 whitespace-pre-line">
                    {recommendation}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-8 text-center text-gray-400">
                  <MessageSquare size={24} className="text-gray-300 mb-2" />
                  <p className="text-xs">Klik pertanyaan cepat di atas atau ketik pertanyaan.</p>
                </div>
              )}
            </div>

            {/* Custom Question Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ketik pertanyaan untuk AI Advisor..."
                  disabled={loading}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5BBCEB] focus:border-transparent transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  aria-label="Kirim"
                  className="w-9 h-9 rounded-xl bg-[#1268A5] hover:bg-[#0E5486] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
