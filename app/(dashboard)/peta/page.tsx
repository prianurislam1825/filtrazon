'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import {
  MapPin, Satellite, Clock, Radio, Navigation, Compass,
  BatteryCharging, Sun, Droplets, Activity, CheckCircle2,
  AlertTriangle, ExternalLink, RefreshCw, Eye, ShieldCheck
} from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { useLang } from '@/lib/i18n/context'

interface NodeLocation {
  id: string
  name: string
  zone: string
  lat: number
  lon: number
  altitude: number
  satellites: number
  hdop: number
  battery: number
  solarVoltage: number
  rssi: number
  status: 'active' | 'standby' | 'warning'
  statusLabel: string
  ph: number
  tds: number
  turbidity: number
  flowLpm: number
  pump: boolean
  uv: boolean
  lastFix: string
}

const DUMMY_NODES: NodeLocation[] = [
  {
    id: 'FILTRAZON-01',
    name: 'Unit Filtrasi 01',
    zone: 'Lokasi Operasional Aktif',
    lat: -6.8228,
    lon: 107.1407,
    altitude: 452,
    satellites: 10,
    hdop: 0.8,
    battery: 94,
    solarVoltage: 19.4,
    rssi: -78,
    status: 'active',
    statusLabel: 'Aktif Menyaring',
    ph: 7.24,
    tds: 142,
    turbidity: 3.6,
    flowLpm: 4.8,
    pump: true,
    uv: true,
    lastFix: 'Baru saja',
  },
]

export default function PetaPage() {
  const { latestReading } = useDashboard()
  const { lang } = useLang()
  const [nodes, setNodes] = useState<NodeLocation[]>(() => DUMMY_NODES.map(n => ({
    ...n,
    statusLabel: n.status === 'active'
      ? (lang === 'id' ? 'Aktif Menyaring' : 'Filtering Active')
      : n.status === 'warning'
      ? (lang === 'id' ? 'Perhatian' : 'Warning')
      : 'Standby',
    lastFix: lang === 'id' ? 'Baru saja' : 'Just now',
  })))
  const [selectedId, setSelectedId] = useState<string>(DUMMY_NODES[0].id)
  const [filter, setFilter] = useState<'all' | 'active' | 'standby' | 'warning'>('all')
  const [isUpdating, setIsUpdating] = useState(false)

  const selectedNode = nodes.find(n => n.id === selectedId) ?? nodes[0]

  const filteredNodes = nodes.filter(n => {
    if (filter === 'all') return true
    return n.status === filter
  })

  // Update node 1 with Firebase data if available
  useEffect(() => {
    // 1. First, apply any sensor data from the local SSE/Cloud (latestReading)
    if (latestReading) {
      setNodes(prev => {
        const newNodes = [...prev]
        const n1 = newNodes.find(n => n.id === 'FILTRAZON-01')
        if (n1) {
          if (latestReading.lat) n1.lat = latestReading.lat
          if (latestReading.lon) n1.lon = latestReading.lon
          n1.ph = latestReading.ph
          n1.turbidity = latestReading.turbidity
          n1.rssi = latestReading.rssi
          n1.battery = latestReading.battery > 0 ? latestReading.battery : n1.battery
          n1.status = latestReading.pump_status ? 'active' : 'standby'
          n1.statusLabel = latestReading.pump_status
            ? (lang === 'id' ? 'Aktif Menyaring' : 'Filtering Active')
            : (lang === 'id' ? 'Standby' : 'Standby')
          n1.lastFix = lang === 'id' ? 'Baru saja (Live Sensor)' : 'Just now (Live Sensor)'
        }
        return newNodes
      })
    }

    // 2. Override GPS specifically from Firebase (because Local Mode doesn't get GPS from Arduino)
    const fetchGps = async () => {
      try {
        const res = await fetch('https://filtrazon-e4ab3-default-rtdb.asia-southeast1.firebasedatabase.app/filtrazon/devices/FILTRAZON-01/gps/latest.json?ts=' + Date.now())
        if (res.ok) {
          const gpsData = await res.json()
          if (gpsData && typeof gpsData.latitude === 'number') {
            setNodes(prev => {
              const newNodes = [...prev]
              const n1 = newNodes.find(n => n.id === 'FILTRAZON-01')
              if (n1) {
                n1.lat = gpsData.latitude
                n1.lon = gpsData.longitude
                n1.lastFix = lang === 'id'
                  ? `Baru saja (GPS 3D Fix - ${gpsData.satellites} Sats)`
                  : `Just now (GPS 3D Fix - ${gpsData.satellites} Sats)`
              }
              return newNodes
            })
          }
        }
      } catch (err) {
        // ignore fetch error
      }
    }

    fetchGps()
    const interval = setInterval(fetchGps, 600000) // Poll GPS every 10m
    return () => clearInterval(interval)
  }, [latestReading])

  // Simulasi refresh GPS
  function handleSimulateGpsUpdate() {
    setIsUpdating(true)
    setTimeout(() => {
      setNodes(prev => prev.map(n => {
        if (n.id !== selectedId) return n
        const jitter = (Math.random() - 0.5) * 0.0003
        return {
          ...n,
          lat: +(n.lat + jitter).toFixed(6),
          lon: +(n.lon + jitter).toFixed(6),
          satellites: Math.min(12, Math.max(6, n.satellites + (Math.random() > 0.5 ? 1 : -1))),
          lastFix: lang === 'id' ? 'Baru saja (Update Live)' : 'Just now (Live Update)',
        }
      }))
      setIsUpdating(false)
    }, 600)
  }

  // Generate OpenStreetMap embed iframe URL centered on selected node
  const delta = 0.012
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${(selectedNode.lon - delta).toFixed(5)}%2C${(selectedNode.lat - delta).toFixed(5)}%2C${(selectedNode.lon + delta).toFixed(5)}%2C${(selectedNode.lat + delta).toFixed(5)}&layer=mapnik&marker=${selectedNode.lat}%2C${selectedNode.lon}`
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedNode.lat},${selectedNode.lon}`

  return (
    <AppShell>
      <div className="px-4 md:px-6 pt-5 pb-6 space-y-4 max-w-7xl mx-auto">
        
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-[#15324A]">
                {lang === 'id' ? 'Peta Penempatan Node IoT' : 'IoT Node Placement Map'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                {lang === 'id' ? 'Mode Dummy Aktif' : 'Dummy Mode Active'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === 'id'
                ? 'Visualisasi geospasial unit penjernih air FILTRAZON & gateway LoRa di lapangan bencana'
                : 'Geospatial visualization of FILTRAZON water purification units & LoRa gateways in disaster field'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateGpsUpdate}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-sky-50 text-xs font-semibold text-gray-700 shadow-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw size={13} className={isUpdating ? 'animate-spin text-sky-600' : 'text-gray-500'} />
              {lang === 'id' ? 'Simulasi Sync GPS' : 'Simulate GPS Sync'}
            </button>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1268A5] hover:bg-[#0E5486] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <ExternalLink size={13} />
              {lang === 'id' ? 'Buka di Google Maps' : 'Open in Google Maps'}
            </a>
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['all', 'active', 'standby', 'warning'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize whitespace-nowrap ${
                filter === tab
                  ? 'bg-[#1268A5] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab === 'all' && (lang === 'id' ? `Semua Node (${nodes.length})` : `All Nodes (${nodes.length})`)}
              {tab === 'active' && (lang === 'id' ? `Aktif (${nodes.filter(n => n.status === 'active').length})` : `Active (${nodes.filter(n => n.status === 'active').length})`)}
              {tab === 'standby' && `Standby (${nodes.filter(n => n.status === 'standby').length})`}
              {tab === 'warning' && (lang === 'id' ? `Perhatian (${nodes.filter(n => n.status === 'warning').length})` : `Warning (${nodes.filter(n => n.status === 'warning').length})`)}
            </button>
          ))}
        </div>

        {/* ── Main Map + Node Selector Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Left Column: Interactive Node List (4 cols) */}
          <div className="lg:col-span-4 space-y-2.5 order-2 lg:order-1">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              <span>{lang === 'id' ? 'Daftar Titik Penempatan' : 'Placement Points'}</span>
              <span className="text-[11px] font-normal lowercase">{filteredNodes.length} unit</span>
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {filteredNodes.map(node => {
                const isSelected = node.id === selectedId
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedId(node.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-50/80 border-[#5BBCEB] ring-2 ring-[#5BBCEB]/30 shadow-sm'
                        : 'bg-white border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          node.id.startsWith('GW')
                            ? 'bg-purple-100 text-purple-700'
                            : node.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : node.status === 'warning'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {node.id.startsWith('GW') ? <Radio size={16} /> : <MapPin size={16} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-xs font-bold text-[#15324A]">{node.id}</h3>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              node.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : node.status === 'warning'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                              {node.statusLabel}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-gray-700 line-clamp-1">{node.name}</p>
                        </div>
                      </div>
                      
                      <button
                        title="Pilih dan Pusatkan Peta"
                        className="p-1 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-100/50"
                      >
                        <Eye size={14} />
                      </button>
                    </div>

                    <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                      <Navigation size={10} className="shrink-0 text-gray-400" />
                      {node.zone}
                    </p>

                    {/* Sensor badges */}
                    {!node.id.startsWith('GW') && (
                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-600">
                        <span>pH: <strong>{node.ph}</strong></span>
                        <span>TDS: <strong>{node.tds}</strong></span>
                        <span>{lang === 'id' ? 'Keruh' : 'Turb'}: <strong>{node.turbidity}</strong></span>
                        <span>{lang === 'id' ? 'Debit' : 'Flow'}: <strong>{node.flowLpm} L/m</strong></span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Live Map Container (8 cols) */}
          <div className="lg:col-span-8 space-y-3 order-1 lg:order-2">
            <div className="card overflow-hidden border border-gray-200 shadow-sm relative">
              {/* Map Top Bar */}
              <div className="px-4 py-2.5 bg-gradient-to-r from-[#1268A5] to-[#1E3A5F] text-white flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Compass size={15} className="text-sky-300" />
                  <span>{lang === 'id' ? 'Titik Fokus' : 'Focus Point'}: <strong>{selectedNode.id}</strong> — {selectedNode.zone}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-sky-200">
                  <span>GPS 3D Fix ({selectedNode.satellites} Sats)</span>
                </div>
              </div>

              {/* Embedded Real OSM Map */}
              <div className="relative w-full h-[380px] sm:h-[420px] bg-slate-100">
                <iframe
                  title="Peta Lokasi OpenStreetMap"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={osmUrl}
                  className="w-full h-full border-0"
                />

                {/* Tactical Pin Card Overlay */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-gray-200/80 max-w-xs pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[11px] font-bold text-gray-800">
                      {selectedNode.id} {lang === 'id' ? 'Terpilih' : 'Selected'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                    {selectedNode.lat.toFixed(5)}, {selectedNode.lon.toFixed(5)}
                  </p>
                </div>
              </div>

              {/* Map Footer Toolbar */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>{lang === 'id' ? 'Kordinat Terverifikasi Lapangan (NEO-6M GPS Receiver)' : 'Field-Verified Coordinates (NEO-6M GPS Receiver)'}</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  {lang === 'id' ? 'Pembaruan terakhir' : 'Last updated'}: {selectedNode.lastFix}
                </div>
              </div>
            </div>

            {/* ── Node Telemetry & Hardware Status Grid ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="card p-3 bg-white border border-gray-200/80">
                <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                  <Satellite size={13} className="text-sky-600" />
                  <span className="text-[10px] font-semibold uppercase">{lang === 'id' ? 'Koordinat GPS' : 'GPS Coordinates'}</span>
                </div>
                <p className="text-xs font-mono font-bold text-gray-800">{selectedNode.lat.toFixed(4)}, {selectedNode.lon.toFixed(4)}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Alt: {selectedNode.altitude} mdpl</p>
              </div>

              <div className="card p-3 bg-white border border-gray-200/80">
                <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                  <Radio size={13} className="text-indigo-600" />
                  <span className="text-[10px] font-semibold uppercase">{lang === 'id' ? 'Satelit & HDOP' : 'Satellites & HDOP'}</span>
                </div>
                <p className="text-xs font-bold text-gray-800">{selectedNode.satellites} {lang === 'id' ? 'Satelit Terkunci' : 'Satellites Locked'}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">HDOP: {selectedNode.hdop} ({lang === 'id' ? 'Akurat' : 'Accurate'})</p>
              </div>

              <div className="card p-3 bg-white border border-gray-200/80">
                <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                  <BatteryCharging size={13} className="text-emerald-600" />
                  <span className="text-[10px] font-semibold uppercase">{lang === 'id' ? 'Daya & Solar' : 'Power & Solar'}</span>
                </div>
                <p className="text-xs font-bold text-emerald-700">{selectedNode.battery}% ({lang === 'id' ? 'Baterai' : 'Battery'})</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Solar PV: {selectedNode.solarVoltage} V</p>
              </div>

              <div className="card p-3 bg-white border border-gray-200/80">
                <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                  <Radio size={13} className="text-purple-600" />
                  <span className="text-[10px] font-semibold uppercase">{lang === 'id' ? 'Sinyal LoRa' : 'LoRa Signal'}</span>
                </div>
                <p className="text-xs font-bold text-purple-700">{selectedNode.rssi} dBm</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{lang === 'id' ? 'Frekuensi' : 'Frequency'} 915 MHz</p>
              </div>
            </div>

            {/* ── Water Quality Summary for Selected Node ── */}
            {!selectedNode.id.startsWith('GW') && (
              <div className="card p-4 bg-white border border-gray-200/80">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-[#15324A] flex items-center gap-1.5">
                    <Droplets size={14} className="text-sky-600" />
                    {lang === 'id' ? `Kualitas Air di Titik Ini (${selectedNode.id})` : `Water Quality at This Point (${selectedNode.id})`}
                  </h4>
                  <span className="text-[11px] font-semibold text-gray-500">
                    {lang === 'id' ? 'Pompa' : 'Pump'}: {selectedNode.pump ? '🟢 ON' : '⚪ OFF'} | UV: {selectedNode.uv ? '🟢 ON' : '⚪ OFF'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                    <span className="text-[10px] text-gray-500 block">pH Sensor</span>
                    <span className="text-sm font-black text-sky-900">{selectedNode.ph}</span>
                    <span className="text-[9px] text-emerald-600 block mt-0.5 font-medium">{lang === 'id' ? 'Baku Mutu Aman' : 'Safe Quality'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <span className="text-[10px] text-gray-500 block">TDS</span>
                    <span className="text-sm font-black text-indigo-900">{selectedNode.tds} <span className="text-[10px] font-normal">ppm</span></span>
                    <span className="text-[9px] text-emerald-600 block mt-0.5 font-medium">{lang === 'id' ? 'Memenuhi Standar' : 'Meets Standard'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-teal-50/50 border border-teal-100">
                    <span className="text-[10px] text-gray-500 block">{lang === 'id' ? 'Kekeruhan' : 'Turbidity'}</span>
                    <span className="text-sm font-black text-teal-900">{selectedNode.turbidity} <span className="text-[10px] font-normal">NTU</span></span>
                    <span className={`text-[9px] block mt-0.5 font-medium ${selectedNode.turbidity > 25 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {selectedNode.turbidity > 25
                        ? (lang === 'id' ? 'Kekeruhan Meningkat' : 'Turbidity Rising')
                        : (lang === 'id' ? 'Jernih' : 'Clear')}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-cyan-50/50 border border-cyan-100">
                    <span className="text-[10px] text-gray-500 block">{lang === 'id' ? 'Debit Filtrasi' : 'Flow Rate'}</span>
                    <span className="text-sm font-black text-cyan-900">{selectedNode.flowLpm} <span className="text-[10px] font-normal">L/min</span></span>
                    <span className="text-[9px] text-gray-500 block mt-0.5">{lang === 'id' ? 'Aliran Operasional' : 'Operational Flow'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </AppShell>
  )
}
