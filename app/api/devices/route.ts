// GET /api/devices
// Returns node + gateway info enriched with latest Firebase data

import { isLocalMode } from '@/lib/config'
import { getFirebaseState } from '@/lib/firebase/state'
import type { Device, Gateway } from '@/types'

export async function GET(): Promise<Response> {
  // Pull latest data from Firebase state (populated by /api/firebase-sync)
  const fb    = getFirebaseState()
  const fbR   = fb.lastReading
  const now   = new Date().toISOString()

  // ── Enrich node from Firebase ─────────────────────────────
  const nodeOnline = fbR !== null && fb.firebaseConnected &&
    fb.lastFetchedAt !== null &&
    (Date.now() - new Date(fb.lastFetchedAt).getTime()) < 30_000

  const nodeFromFb: Device = {
    id:        fbR?.device_id  ?? 'FILTRAZON-01',
    name:      'FILTRAZON NODE 01',
    type:      'node',
    status:    nodeOnline ? 'online' : fb.firebaseConnected ? 'warning' : 'offline',
    last_seen: fb.lastFetchedAt ?? null,
    uptime_ms: fbR?.uptime_ms  ?? 0,
    battery:   fbR?.battery    ?? 0,
    last_seq:  fbR?.seq        ?? 0,
    firmware:  'v1.x (Firebase)',
    sd_backup: false,
  }

  const gwFromFb: Gateway = {
    id:              fbR?.gateway  ?? 'GW-01',
    name:            'GATEWAY 01',
    type:            'gateway',
    status:          nodeOnline ? 'online' : 'offline',
    last_seen:       fb.lastFetchedAt ?? null,
    lora_connected:  nodeOnline,
    wifi_connected:  fb.firebaseConnected,
    usb_connected:   false,
    last_rssi:       fbR?.rssi   ?? undefined,
    last_snr:        fbR?.snr    ?? undefined,
    queued_packets:  0,
    last_sync:       fb.lastFetchedAt ?? null,
  }

  if (!isLocalMode()) {
    try {
      const { query } = await import('@/lib/db/client')

      // Get base device/gateway rows from DB
      const [dbDevices, dbGateways] = await Promise.all([
        query<Device>('SELECT * FROM devices  ORDER BY id'),
        query<Gateway>('SELECT * FROM gateways ORDER BY id'),
      ])

      // Merge Firebase enrichment into DB rows
      const devices = dbDevices.map(d =>
        d.id === nodeFromFb.id
          ? { ...d, ...nodeFromFb }
          : d,
      )
      const gateways = dbGateways.map(g =>
        g.id === gwFromFb.id
          ? { ...g, ...gwFromFb }
          : g,
      )

      return Response.json({ ok: true, data: { devices, gateways }, source: 'db+firebase' })
    } catch (err) {
      console.error('[devices] DB error, falling back to Firebase only:', err)
    }
  }

  // Local mode or DB failed — return Firebase-enriched data
  return Response.json({
    ok:   true,
    data: { devices: [nodeFromFb], gateways: [gwFromFb] },
    source: fbR ? 'firebase' : 'default',
  })
}
