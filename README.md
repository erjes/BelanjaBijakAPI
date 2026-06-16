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
- `POST /api/auth/register`
- `POST /api/auth/login`

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

`POST /api/auth/register`

```json
{
  "name": "Nama Pengguna",
  "email": "user@example.com",
  "password": "password123",
  "photoUrl": "https://example.com/foto.jpg"
}
```

`POST /api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response `register` dan `login` berisi `user`, `token`, `tokenType`, dan `expiresIn`. Simpan token di aplikasi, misalnya DataStore, supaya pengguna tetap login ketika aplikasi ditutup lalu dibuka lagi.

`POST /api/auth/logout`

Endpoint ini membutuhkan JWT. Setelah sukses, hapus token dari penyimpanan aplikasi.

`POST /api/auth/token`

Endpoint ini opsional untuk token app statis berbasis `JWT_SECRET`. Untuk login pengguna nyata, gunakan `register` dan `login`.

### Profile

`GET /api/profile`

Mengambil profil user login berisi `id`, `name`, `email`, `photoUrl`, `createdAt`, dan `updatedAt`.

`PATCH /api/profile`

```json
{
  "name": "Nama Baru",
  "photoUrl": "https://example.com/foto-baru.jpg"
}
```

Gunakan `photoUrl` untuk menampilkan foto profil dalam bentuk circle di aplikasi.

### Posts Teks + Gambar

Endpoint ini bisa dipakai untuk fitur kirim data berupa teks dan gambar ke server.

`GET /api/posts`

Mengambil list post milik user login dalam bentuk JSON, urut terbaru.

`POST /api/posts`

Mengirim teks dan gambar. Kirim salah satu dari `imageUrl` atau `imageDataUrl`.

```json
{
  "text": "Belanja hemat hari ini",
  "imageUrl": "https://example.com/bukti-belanja.jpg"
}
```

Atau:

```json
{
  "text": "Belanja hemat hari ini",
  "imageDataUrl": "data:image/jpeg;base64,/9j/..."
}
```

`GET /api/posts/:id`

`PATCH /api/posts/:id`

```json
{
  "text": "Teks diperbarui"
}
```

`DELETE /api/posts/:id`

Menghapus post milik user login. Di aplikasi, tampilkan dialog konfirmasi sebelum request delete, lalu panggil ulang `GET /api/posts` jika berhasil agar list otomatis ter-update.

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

## Checklist Rubrik Aplikasi

- Login/logout: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`.
- Tetap login setelah aplikasi ditutup: simpan JWT dari response login di DataStore/EncryptedSharedPreferences.
- Profil nama, email, foto circle: `GET /api/profile`, `PATCH /api/profile`.
- Ambil data internet berupa JSON dan gambar sesuai user login: `GET /api/posts` mengembalikan JSON dan field `imageUrl`/`imageDataUrl`.
- Kirim data teks dan gambar: `POST /api/posts`.
- Hapus data setelah dialog konfirmasi: `DELETE /api/posts/:id`, lalu refresh list.
- Loading/error/offline: API mengembalikan status HTTP konsisten (`401`, `400`, `404`, `500`) dan body `error`; indikator loading serta fallback offline ditangani di aplikasi Android.
- REST API + Room offline-first: gunakan endpoint ini sebagai remote source, Room sebagai local cache.
- CRUD lengkap: tersedia pada `pengeluaran`, `keranjang`, `profile`, dan `posts`.
