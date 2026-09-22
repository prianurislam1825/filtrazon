import { execute } from '@/lib/db/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await execute('ALTER TABLE readings ADD COLUMN lat FLOAT NULL, ADD COLUMN lon FLOAT NULL;', [])
    return NextResponse.json({ success: true, message: 'Migration successful!' })
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      return NextResponse.json({ success: true, message: 'Columns already exist.' })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
