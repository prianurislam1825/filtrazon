# FILTRAZON — IoT Water Purification Monitoring

Dashboard monitoring real-time untuk sistem purifikasi air portabel berbasis IoT, dirancang untuk respons bencana.

## Stack

- **Next.js 16.3.1** (App Router)
- **Firebase Realtime Database** — sumber data realtime
- **MySQL (XAMPP)** — penyimpanan history/snapshot
- **next-auth v5** — autentikasi
- **Tailwind CSS v4**, **Recharts**, **Lucide React**

---

## Arsitektur Data

```
FILTRAZON DEVICE
      ↓ LoRa
  GATEWAY v5
      ↓
Firebase Realtime Database
      │
      ├── /filtrazon/devices/FILTRAZON-01/latest  → REALTIME DASHBOARD
      ├── /filtrazon/cmd                          ← RELAY CONTROL
      │
      └── BACKEND (Next.js)
                ↓
           MySQL Lokal
                ↓
          RIWAYAT / HISTORY
```

**Firebase = source of truth realtime**
**MySQL = storage riwayat/snapshot**

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Konfigurasi environment

Salin `.env.example` ke `.env.local` dan sesuaikan:

```bash
cp .env.example .env.local
```

| Variable | Keterangan |
|----------|-----------|
| `APP_MODE` | `cloud` (auth + MySQL) atau `local` (tanpa auth) |
| `DATABASE_URL` | `mysql://root:@localhost:3306/filtrazon` |
| `NEXTAUTH_SECRET` | Secret JWT — generate dengan `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` |
| `FIREBASE_RTDB_URL` | URL Firebase Realtime Database |
| `FIREBASE_DEVICE_PATH` | `/filtrazon/devices/FILTRAZON-01/latest` |
| `FIREBASE_CMD_PATH` | `/filtrazon/cmd` |
| `FIREBASE_AUTH_TOKEN` | Token Firebase (jika rules memerlukan auth) |
| `DEVICE_TOKEN` | Token untuk endpoint `/api/ingest` |

### 3. Setup database MySQL

Jalankan schema SQL di phpMyAdmin atau mysql CLI:

```bash
mysql -u root filtrazon < lib/db/schema.sql
```

Atau buka `http://localhost/phpmyadmin`, buat database `filtrazon`, lalu import file `lib/db/schema.sql`.

### 4. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## Login Default

| Field | Value |
|-------|-------|
| Email | `admin@filtrazon.local` |
| Password | `filtrazon123` |

---

## Halaman

| Halaman | Route | Deskripsi |
|---------|-------|-----------|
| Dashboard | `/` | Monitoring realtime — sensor, status, chart |
| Riwayat | `/riwayat` | History dari MySQL — filter, pagination, export CSV |
| Perangkat | `/perangkat` | Status node & gateway dari Firebase |
| Alert | `/alert` | Alert realtime via SSE |
| Kontrol | `/kontrol` | Kontrol relay — command ke Firebase `/cmd` |
| Peta | `/peta` | Lokasi GPS (belum tersedia) |
| Pengaturan | `/pengaturan` | Konfigurasi sistem (Phase 2) |

---

## API Routes

| Route | Method | Deskripsi |
|-------|--------|-----------|
| `/api/firebase-sync` | GET | Fetch Firebase → MySQL + SSE broadcast |
| `/api/latest` | GET | Data terbaru (cache → DB → Firebase → mock) |
| `/api/live` | GET | SSE stream realtime |
| `/api/history` | GET | Riwayat dari MySQL (paginated) |
| `/api/chart` | GET | Chart data dari MySQL |
| `/api/devices` | GET | Info node + gateway |
| `/api/alerts` | GET | Daftar alert |
| `/api/control` | POST | Kirim relay command ke Firebase `/cmd` |
| `/api/export` | GET | Export CSV |
| `/api/ingest` | POST | Terima telemetri dari perangkat (opsional) |

---

## Relay Control

Command yang didukung:

```
R1ON  R1OFF   R2ON  R2OFF
R3ON  R3OFF   R4ON  R4OFF
ALLON  ALLOFF  FLOWRESET
DEMOON  DEMOOFF
```

Format command: `R1ON` atau `FILTRAZON-01:R1ON`

Alur: `Web → /api/control → Firebase /cmd → Gateway → LoRa → Node → ACK → Firebase /latest → UI`

Status relay di UI selalu berasal dari Firebase `/latest` (non-optimistic). Latensi normal 2–8 detik.

---

## Threshold Sensor

| Parameter | Normal | Warning | Critical |
|-----------|--------|---------|----------|
| pH | 6.5–8.5 | 6.0–6.5 / 8.5–9.0 | < 6.0 / > 9.0 |
| TDS | ≤ 300 ppm | 300–500 ppm | > 500 ppm |
| Turbidity | ≤ 100 NTU | 100–500 NTU | > 500 NTU |
| Flow (pompa ON) | > 0.5 L/min | 0.1–0.5 L/min | ≤ 0 L/min |

**Catatan khusus:**
- `battery = -1` → placeholder (bukan error)
- `flags & 0x08` → mode demo aktif
- Kombinasi pH=14, TDS=0, Turbidity=3000 dapat menandakan sensor terlepas

---

## Firebase Paths

| Path | Akses | Keterangan |
|------|-------|-----------|
| `/filtrazon/devices/FILTRAZON-01/latest` | Read | Data sensor terbaru |
| `/filtrazon/devices/FILTRAZON-01/history` | Read | Riwayat Firebase (limit query) |
| `/filtrazon/cmd` | Write | Relay command dari web |

---

## Status Koneksi

| Status | Kondisi |
|--------|---------|
| 🟢 LIVE | Data diperbarui < 10 detik |
| 🟡 STALE | Data diperbarui 10–30 detik |
| 🔴 OFFLINE | Data diperbarui > 30 detik |
