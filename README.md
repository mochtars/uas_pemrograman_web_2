# 🍞 Roti Ben-oi - Toko Roti Online

Aplikasi web full-stack toko roti online untuk UAS Pemrograman Web 2.

**Nama:** Beni Mochtar Samiraharja · **NIM:** 23552011382 · **Kelas:** TIF K 23B · Universitas Teknologi Bandung

## Deskripsi

Roti Ben-oi adalah aplikasi toko roti online. Pelanggan dapat melihat menu dan membuat pesanan, sedangkan admin dapat mengelola produk dan memproses pesanan. Repository ini berbentuk monorepo dengan backend dan frontend terpisah:

```
uas-pemweb/
├── backend/    → REST API Express.js + PostgreSQL (port 4000)
│   └── db/schema.sql
└── frontend/   → Next.js (React) + Tailwind CSS (port 3000)
```

### Fitur (2 rumpun CRUD yang saling berelasi)

**CRUD Produk** (`/produk`)
- Tambah, lihat, ubah, dan hapus produk (nama, kategori, harga, stok, deskripsi)
- Produk yang sudah dipakai di pesanan tidak bisa dihapus (proteksi foreign key)

**CRUD Pesanan** (`/pesanan`)
- Buat pesanan berisi banyak item produk (relasi `pesanan_item` → `produk`)
- Total dihitung otomatis dan stok produk berkurang saat pesanan dibuat (transaksi database)
- Ubah status pesanan (diproses / selesai / dibatalkan) dan hapus pesanan

### Relasi Tabel

```
produk (1) ──< pesanan_item >── (1) pesanan
```

- `pesanan_item.produk_id` → `produk.id`
- `pesanan_item.pesanan_id` → `pesanan.id` (ON DELETE CASCADE)

## Teknologi

| Bagian    | Teknologi                          |
| --------- | ---------------------------------- |
| Frontend  | Next.js 16 (React), Tailwind CSS   |
| Backend   | Express.js (REST API)              |
| Database  | PostgreSQL (driver `pg`)           |

## Cara Menjalankan di Lokal

### 1. Prasyarat

- Node.js versi 20 atau lebih baru
- PostgreSQL versi 14 atau lebih baru (service sudah berjalan)

### 2. Clone repository

```bash
git clone https://github.com/USERNAME/uas-pemweb.git
cd uas-pemweb
```

### 3. Siapkan database

Buat database lalu jalankan skema beserta data awal:

```bash
createdb toko_roti
psql -d toko_roti -f backend/db/schema.sql
```

### 4. Jalankan Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` dan sesuaikan koneksi database:

```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/toko_roti
PORT=4000
```

(Jika PostgreSQL lokal tanpa password, cukup `postgresql://USER@localhost:5432/toko_roti`)

Lalu jalankan:

```bash
npm run dev
```

Backend berjalan di **http://localhost:4000**. Tes cepat: buka http://localhost:4000/api/produk

### 5. Jalankan Frontend

Buka terminal baru:

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di **http://localhost:3000**. Request `/api/*` otomatis diteruskan ke backend port 4000 (diatur di `next.config.mjs`).

### Alternatif: jalankan keduanya dengan satu perintah

Dari folder root repository:

```bash
npm install   # sekali saja, menginstall concurrently
npm run dev   # menjalankan backend (4000) dan frontend (3000) sekaligus
```

## Dokumentasi API (Backend)

| Method | Endpoint            | Keterangan                                  |
| ------ | ------------------- | ------------------------------------------- |
| GET    | `/api/produk`       | Ambil semua produk                          |
| POST   | `/api/produk`       | Tambah produk baru                          |
| GET    | `/api/produk/:id`   | Detail satu produk                          |
| PUT    | `/api/produk/:id`   | Ubah produk                                 |
| DELETE | `/api/produk/:id`   | Hapus produk                                |
| GET    | `/api/pesanan`      | Ambil semua pesanan beserta item            |
| POST   | `/api/pesanan`      | Buat pesanan baru (stok otomatis berkurang) |
| GET    | `/api/pesanan/:id`  | Detail satu pesanan beserta item            |
| PUT    | `/api/pesanan/:id`  | Ubah status pesanan                         |
| DELETE | `/api/pesanan/:id`  | Hapus pesanan                               |

## Halaman (Frontend)

- `/` : Menu toko (landing page)
- `/produk` : Kelola produk (admin)
- `/pesanan` : Daftar pesanan dan ubah status
- `/pesanan/baru` : Form buat pesanan
