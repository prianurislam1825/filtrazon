import { insertReading } from '@/lib/db/readings'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    for (let i = 0; i < 10; i++) {
      await insertReading({
        device_id: 'FILTRAZON-01',
        seq: Math.floor(Math.random() * 10000),
        uptime_ms: 1000000 + i * 10000,
        ph: 7.0 + (Math.random() * 0.4 - 0.2),
        tds: 150 + Math.floor(Math.random() * 20),
        turbidity: 0.5 + (Math.random() * 1.5),
        flow_lpm: 3.5 + (Math.random() * 0.5),
        total_liters: 1000 + i * 2,
        pump_status: true,
        uv_status: true,
        relay1: true,
        relay2: true,
        relay3: false,
        relay4: false,
        flags: 0,
        battery: 90 + Math.floor(Math.random() * 10),
        rssi: -70 + Math.floor(Math.random() * 10),
        snr: 8 + Math.random() * 2,
        gateway: 'GW-01',
        received_at: new Date(Date.now() - (10 - i) * 60000).toISOString(),
        lat: -7.5781 + (Math.random() * 0.0001),
        lon: 110.8098 + (Math.random() * 0.0001)
      } as any)
    }
    return NextResponse.json({ success: true, message: '10 dummy rows inserted successfully!' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
