import AppShell from '@/components/layout/AppShell'
import { MapPin, Satellite, Clock } from 'lucide-react'

export default function PetaPage() {
  return (
    <AppShell>
      <div className="px-4 md:px-6 pt-5 pb-4 space-y-4">
        <div>
          <h1 className="text-lg font-bold text-[#15324A]">Peta Lokasi</h1>
          <p className="text-xs text-gray-400 mt-0.5">Location monitoring — GPS module pending</p>
        </div>

        {/* Map placeholder */}
        <div className="card overflow-hidden">
          <div className="relative h-64 md:h-96 bg-gradient-to-br from-[#EAF8FC] to-[#dbeafe] flex flex-col items-center justify-center">
            {/* Grid lines for map feel */}
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'linear-gradient(#5BBCEB 1px, transparent 1px), linear-gradient(90deg, #5BBCEB 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="relative flex flex-col items-center text-center px-6">
              <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center mb-3">
                <MapPin size={28} className="text-[#1268A5]" />
              </div>
              <p className="font-bold text-[#15324A] text-sm">GPS Module Not Connected</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                NEO-6M GPS module is awaiting hardware integration. Location monitoring will be available after installation.
              </p>
            </div>
          </div>

          {/* GPS data fields (ready for integration) */}
          <div className="p-4 border-t border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">GPS Data Fields</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Latitude',  value: '—', icon: <Satellite size={14} /> },
                { label: 'Longitude', value: '—', icon: <Satellite size={14} /> },
                { label: 'Accuracy',  value: '—', icon: <MapPin size={14} />    },
                { label: 'Last Fix',  value: '—', icon: <Clock size={14} />     },
              ].map(f => (
                <div key={f.label} className="p-2.5 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-1.5 mb-1 text-gray-400">{f.icon}<span className="text-[10px] font-medium">{f.label}</span></div>
                  <p className="text-sm font-bold text-gray-400">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
