// Global augmentations for Next.js in-memory singletons
import type { Reading } from './index'

declare global {
  // In-memory latest reading cache (set by /api/ingest, read by /api/latest)
  var __latestReading: Reading | undefined
}

export {}
