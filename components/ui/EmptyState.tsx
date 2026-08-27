import { WifiOff, Database, RefreshCw } from 'lucide-react'

type EmptyVariant = 'no-data' | 'offline' | 'reconnecting' | 'error'

interface EmptyStateProps {
  variant?:    EmptyVariant
  title?:      string
  message?:    string
  action?:     { label: string; onClick: () => void }
}

const DEFAULTS: Record<EmptyVariant, { icon: React.ReactNode; title: string; message: string }> = {
  'no-data': {
    icon:    <Database size={32} className="text-gray-300" />,
    title:   'No telemetry received yet',
    message: 'Waiting for the first packet from FILTRAZON NODE...',
  },
  offline: {
    icon:    <WifiOff size={32} className="text-gray-300" />,
    title:   'Device Offline',
    message: 'No data received in the last 30 seconds.',
  },
  reconnecting: {
    icon:    <RefreshCw size={32} className="text-[#5BBCEB] animate-spin" />,
    title:   'Reconnecting...',
    message: 'Realtime connection interrupted. Reconnecting to FILTRAZON Gateway...',
  },
  error: {
    icon:    <WifiOff size={32} className="text-red-300" />,
    title:   'Connection error',
    message: 'Unable to fetch data. Please try again.',
  },
}

export default function EmptyState({
  variant = 'no-data',
  title,
  message,
  action,
}: EmptyStateProps) {
  const d = DEFAULTS[variant]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center" role="status">
      <div className="mb-4">{d.icon}</div>
      <h3 className="text-sm font-semibold text-gray-600 mb-1">{title ?? d.title}</h3>
      <p className="text-xs text-gray-400 max-w-xs leading-relaxed">{message ?? d.message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-[#1268A5] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BBCEB] rounded"
        >
          <RefreshCw size={12} />
          {action.label}
        </button>
      )}
    </div>
  )
}
