# Belanja Bijak API

API Next.js untuk aplikasi Android Belanja Bijak. Project ini memakai Next.js App Router, Prisma, dan PostgreSQL agar siap dideploy ke Vercel.

## Setup Lokal

1. Install dependency:

   ```bash
   npm install
   ```

2. Salin `.env.example` menjadi `.env`, lalu isi `DATABASE_URL` dan `JWT_SECRET`.

3. Jalankan migrasi database:

   ```bash
   npx prisma migrate deploy
   ```

4. Jalankan server:

   ```bash
   npm run dev
   ```

Base URL lokal: `http://localhost:3000`

## Deploy ke Vercel

1. Buat database PostgreSQL, misalnya Vercel Postgres, Neon, Supabase, atau Railway.
2. Tambahkan environment variable `DATABASE_URL` dan `JWT_SECRET` di Project Settings Vercel.
3. Deploy repository ini ke Vercel.
4. Jalankan migrasi setelah deploy:

   ```bash
   npx prisma migrate deploy
   ```

Build command default project ini adalah:

```bash
npm run build
```

## Endpoint

## Autentikasi JWT

Semua endpoint `/api/*` diproteksi JWT, kecuali:

- `GET /api/health`
- `POST /api/auth/token`

Tambahkan environment variable di Vercel:

```text
Key: JWT_SECRET
Value: isi_secretnya
```

Ambil token:

```http
POST /api/auth/token
Content-Type: application/json

{
  "secret": "isi_secretnya"
}
```

Gunakan token untuk endpoint lain:

```http
Authorization: Bearer TOKEN_DARI_RESPONSE
```

Semua response sukses memakai bentuk:

```json
{
  "data": {}
}
```

### Health

`GET /api/health`

### Auth

`POST /api/auth/token`

### Pengeluaran

`GET /api/pengeluaran`

Query opsional:

- `bulan=yyyy-MM`, contoh `2026-06`
- `includeDeleted=true` untuk ikut mengambil data recycle bin

`POST /api/pengeluaran`

```json
{
  "namaBarang": "Beras",
  "harga": 75000,
  "jumlah": 1,
  "tanggal": "2026-06-16",
  "kategori": "Sembako"
}
```

`GET /api/pengeluaran/:id`

`PATCH /api/pengeluaran/:id`

Body boleh berisi sebagian field:

```json
{
  "namaBarang": "Beras premium",
  "harga": 82000
}
```

`DELETE /api/pengeluaran/:id`

Default-nya soft delete ke recycle bin.

`DELETE /api/pengeluaran/:id?permanent=true`

Menghapus permanen.

`POST /api/pengeluaran/:id/restore`

Mengembalikan data dari recycle bin.

### Recycle Bin

`GET /api/recycle-bin`

### Keranjang Belanja

`GET /api/keranjang`

`POST /api/keranjang`

```json
{
  "namaProduk": "Minyak goreng",
  "perkiraanHarga": 18000,
  "ukuranIsi": 1,
  "isChecked": false
}
```

`GET /api/keranjang/:id`

`PATCH /api/keranjang/:id`

```json
{
  "isChecked": true
}
```

`DELETE /api/keranjang/:id`

### Compare

`POST /api/compare`

```json
{
  "productA": {
    "harga": 18000,
    "ukuranIsi": 1
  },
  "productB": {
    "harga": 32000,
    "ukuranIsi": 2
  }
}
```

Response berisi `unitCostA`, `unitCostB`, `difference`, `winner`, dan `message`.
