# Image Migration to Cloudinary CDN

Script untuk memindahkan semua gambar yang embedded di **database** ke Cloudinary CDN:
- **Tabel `questions`**: Gambar base64 di kolom `question_text`
- **Tabel `question_passages`**: Gambar base64 dan URL eksternal di kolom `passage`

## Prerequisites

1. **Akun Cloudinary** (gratis): https://cloudinary.com/users/register/free
2. **PostgreSQL database** dengan tabel `questions`
3. **Package dependencies** sudah terinstall (lihat bagian instalasi)

## Setup

### 1. Buat Akun Cloudinary

1. Daftar di https://cloudinary.com/users/register/free
2. Setelah login, masuk ke Dashboard
3. Catat kredensial berikut:
   - Cloud Name
   - API Key
   - API Secret

### 2. Tambahkan Environment Variables

Tambahkan kredensial Cloudinary dan Database ke file `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_SSL=false

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Install Dependencies

```bash
npm install cloudinary cheerio pg axios
```

**Dependencies yang dibutuhkan:**
- `cloudinary`: Upload images ke Cloudinary CDN
- `cheerio`: Parse dan manipulasi HTML
- `pg`: PostgreSQL client
- `axios`: Download images dari external URLs

## Cara Menggunakan

### Migration 1: Questions Table

Migrasi gambar base64 dari tabel `questions` kolom `question_text`.

#### Dry Run (Test Mode)

Jalankan dulu dalam mode dry run untuk melihat apa yang akan dilakukan tanpa mengubah database:

```bash
node scripts/cdn/migrate-images-to-cloudinary.js --dry-run
```

#### Production Run

Setelah yakin, jalankan migrasi sebenarnya:

```bash
node scripts/cdn/migrate-images-to-cloudinary.js
```

### Migration 2: Question Passages Table

Migrasi gambar dari tabel `question_passages` kolom `passage`. Script ini bisa handle:
- **Base64 images** (data:image/...)
- **External URLs** (http://..., https://...) seperti dari CDN Ruangguru

#### Dry Run (Test Mode)

```bash
node scripts/cdn/migrate-passage-images-to-cloudinary.js --dry-run
```

#### Production Run

```bash
node scripts/cdn/migrate-passage-images-to-cloudinary.js
```

## Apa yang Dilakukan Script Ini?

### Script 1: migrate-images-to-cloudinary.js (Questions)

1. **Query** database untuk semua pertanyaan dengan gambar base64 embedded
   ```sql
   SELECT id, question_text 
   FROM questions 
   WHERE question_text ILIKE '%data:image%'
   ```
2. **Extract** gambar base64 dari HTML menggunakan Cheerio
3. **Upload** ke Cloudinary dengan struktur folder:
   - Folder: `futuredu/questions`
   - Naming: `question_{id}_img_{index}`
4. **Replace** URL base64 dengan URL Cloudinary
5. **Update** database dengan HTML yang sudah dimodifikasi

### Script 2: migrate-passage-images-to-cloudinary.js (Passages)

1. **Query** database untuk semua passages dengan gambar
   ```sql
   SELECT id, title, passage 
   FROM question_passages 
   WHERE passage ILIKE '%<img%'
   ```
2. **Extract** gambar dari HTML menggunakan Cheerio
3. **Handle 2 tipe gambar:**
   - **Base64 images**: Upload langsung ke Cloudinary
   - **External URLs**: Download dulu → Upload ke Cloudinary
4. **Upload** ke Cloudinary dengan struktur folder:
   - Folder: `futuredu/passages`
   - Naming: `passage_{id}_img_{index}`
5. **Replace** semua image sources dengan URL Cloudinary
6. **Update** database dengan HTML yang sudah dimodifikasi

**Contoh External URL yang Di-handle:**
```html
<!-- Sebelum: CDN Ruangguru -->
<img src="https://cdn-web.ruangguru.com/landing-pages/assets/hs/2-Oct-04-2022-05-47-23-71-AM.png">

<!-- Setelah: CDN Kita -->
<img src="https://res.cloudinary.com/dl3oqxp6r/image/upload/v1234567890/futuredu/passages/passage_123_img_1.png">
```

## Output

Script akan menampilkan:
- Progress untuk setiap pertanyaan
- Jumlah gambar yang diproses
- URL Cloudinary untuk setiap gambar
- Summary statistik di akhir
- Error jika ada yang gagal

Contoh output:

```
🚀 Starting image migration to Cloudinary...

Mode: DRY RUN (no changes will be made)

Found 15 questions with embedded images

[1/15] Processing question ID: 123
  Processing image 1/2 for question 123...
  ✓ Uploaded: https://res.cloudinary.com/yourcloud/image/upload/v1234567890/futuredu/questions/question_123_img_0.png
  Processing image 2/2 for question 123...
  ✓ Uploaded: https://res.cloudinary.com/yourcloud/image/upload/v1234567890/futuredu/questions/question_123_img_1.png
  ℹ DRY RUN: Would update question 123

...

============================================================
📊 MIGRATION SUMMARY
============================================================
Total questions found:    15
Total images found:       30
Successful uploads:       30
Failed uploads:           0
Questions updated:        0
============================================================

ℹ️  This was a DRY RUN - no changes were made to the database
```

## Troubleshooting

### Error: "Invalid credentials"
- Pastikan environment variables sudah benar
- Cek Cloud Name, API Key, dan API Secret di Cloudinary Dashboard

### Error: "Upload failed"
- Cek koneksi internet
- Pastikan quota Cloudinary free tier belum habis (25 GB storage, 25 GB bandwidth/month)

### Error: "Database connection failed"
- Pastikan PostgreSQL sudah running
- Cek koneksi database di `.env`

## Rollback

Jika perlu rollback, Anda bisa:

1. **Restore dari backup database** (recommended)
2. **Manual**: Download gambar dari Cloudinary dan convert kembali ke base64

Sebaiknya **backup database sebelum menjalankan migrasi**:

```bash
pg_dump your_database > backup_before_cdn_migration.sql
```

## Cloudinary Free Tier Limits

- Storage: 25 GB
- Bandwidth: 25 GB/month
- Transformations: 25 credits/month
- Requests: 25k requests/month

Untuk 1000 gambar dengan rata-rata 500KB per gambar = ~500MB storage (masih sangat aman dalam free tier).

## Notes

- Script akan otomatis membuat folder `futuredu/questions` di Cloudinary
- Gambar akan di-overwrite jika sudah ada (berdasarkan question_id dan index)
- Script menambahkan `updated_at = NOW()` saat update database
- Format gambar (PNG, JPG, dll) akan dipertahankan
