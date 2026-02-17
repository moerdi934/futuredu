# SECTION 3: Statistika dan Probabilitas
## Topic 3.1: Analisis Data

---


## 📋 Materi 3.1.2: Interpretasi Tabel

### Tabel: Si Sederhana yang Penuh Misteri

Tabel itu kayak spreadsheet Excel versi cetak. Simpel? Iya. Gampang? Belum tentu! Di SNBT, tabel sering jadi "rumah" buat jebakan-jebakan maut. Let's break it down!

### Anatomi Tabel yang Wajib Kamu Pahami

Setiap tabel punya struktur standar:

**1. Judul Tabel**
Ini kunci pertama! Judul kasih tau kamu tentang apa sih data ini. 
- "Jumlah Peserta SNBT 2020-2025" → Data tentang peserta SNBT selama 6 tahun
- "Persentase Kelulusan per Jurusan" → Data dalam bentuk persen, bukan angka absolut

**2. Header Kolom & Baris**
Ini "alamat" data kamu. Kayak GPS-nya tabel!

**3. Keterangan/Satuan**
Biasanya di bawah judul atau dalam kurung di header.
Contoh: "dalam jutaan rupiah", "dalam persen (%)", "per 1000 penduduk"

**4. Footnote/Catatan Kaki**
Kadang ada info penting di bawah tabel. Jangan skip!

### Contoh Tabel Real SNBT-Style

```
Pendaftar dan Diterima PTN 2024-2025

Tahun  | Pendaftar | Diterima | Persentase Diterima
-------|-----------|----------|--------------------
2024   |  748.000  | 187.000  |      25,0%
2025   |  802.000  | 193.000  |      24,1%

Catatan: Data per 30 Juni tahun berjalan
```

**Dari tabel sederhana ini, kamu bisa digali:**
- Berapa pendaftar tahun 2024? (748.000)
- Berapa yang diterima 2025? (193.000)
- Tahun mana yang persentase kelulusan lebih tinggi? (2024: 25,0%)
- Berapa kenaikan jumlah pendaftar? (802.000 - 748.000 = 54.000)
- Berapa jumlah yang TIDAK diterima 2025? (802.000 - 193.000 = 609.000)

See? Satu tabel simpel, bisa ditanya macem-macem!

### Teknik Membaca Tabel Like a Pro

#### **Teknik 1: The Intersection Method**
Bayangkan ada garis vertikal dari header kolom dan garis horizontal dari header baris. Titik temunya = data yang kamu cari.

**Praktik:**
Cari "Jumlah diterima tahun 2025"
- Garis vertikal dari kolom "Diterima" ↓
- Garis horizontal dari baris "2025" →
- Ketemu di: 193.000 ✓

#### **Teknik 2: The Highlight & Isolate**
Kalau tabelnya besar dan bikin pusing:
1. Isolasi cuma baris/kolom yang relevan
2. "Hapus" mental data lain
3. Fokus ke subset yang kamu butuhin

#### **Teknik 3: The Sanity Check**
Setelah dapet angka, tanya:
- "Masuk akal nggak nilainya?"
- "Lebih besar/kecil dari nilai lain yang relevan?"
- "Satuan dan konteksnya udah cocok?"

### Jenis Pertanyaan yang Sering Muncul

#### **Level 1: Informasi Langsung (Direct Info)**
Paling gampang - tinggal baca data yang ada.
*"Berapa jumlah pendaftar tahun 2024?"*
→ Tinggal baca: 748.000 ✓

#### **Level 2: Kalkulasi Sederhana**
Perlu operasi matematika dasar.
*"Berapa total pendaftar tahun 2024 dan 2025?"*
→ 748.000 + 802.000 = 1.550.000 ✓

#### **Level 3: Perbandingan**
Membandingkan dua atau lebih data.
*"Berapa selisih jumlah diterima antara 2024 dan 2025?"*
→ 193.000 - 187.000 = 6.000 ✓

#### **Level 4: Persentase & Rasio**
Butuh pemahaman proporsi.
*"Berapa persen kenaikan pendaftar dari 2024 ke 2025?"*
→ (54.000 / 748.000) × 100% ≈ 7,22% ✓

#### **Level 5: Inferensi & Analisis**
Butuh penalaran lebih dalam.
*"Jika tren persentase diterima terus menurun seperti 2024-2025, berapa estimasi persentase diterima tahun 2026?"*
→ Butuh analisis tren: turun 0,9 poin persentase, jadi estimasi sekitar 23,2%

### Tabel Multi-Level (Advanced)

Di SNBT level tinggi, kadang ada tabel dalam tabel atau tabel dengan sub-kategori:

```
Penjualan Buku per Kategori (dalam ribuan)

              | Semester 1 |           | Semester 2 |           |
Kategori      | Online | Toko Fisik | Online | Toko Fisik |
--------------|--------|-----------|---------|------------|
Fiksi         |   45   |    32     |   52    |    28      |
Non-Fiksi     |   38   |    41     |   43    |    39      |
Komik         |   67   |    23     |   71    |    21      |
```

**Strategi baca:**
1. Identifikasi "layer" kategorisasi (Kategori buku, Semester, Channel penjualan)
2. Tentuin "koordinat 3D" data: Kategori + Semester + Channel
3. Baca dengan ekstra hati-hati!

**Pertanyaan tipikal:**
*"Berapa total penjualan Non-Fiksi Semester 2?"*
→ Online S2 + Toko Fisik S2 = 43 + 39 = 82 ribu ✓

### Red Flags dalam Tabel

🚩 **Jebakan #1: Header yang Mirip**
"Pendaftar" vs "Pendaftar Diterima" - beda tipis tapi fatal kalau salah baca!

🚩 **Jebakan #2: Satuan yang Implisit**
Tabel nulis "dalam ribuan" di judul, tapi soal nanya "berapa total penjualan?" 
Jawaban: 45 ribu atau 45.000? Perhatikan konteks pertanyaan!

🚩 **Jebakan #3: Data Kumulatif vs Individual**
"Total pengunjung sampai Maret: 150.000"
Ini kumulatif (Jan+Feb+Mar) bukan cuma bulan Maret!

🚩 **Jebakan #4: Persentase dari Basis yang Berbeda**
Tabel 1: "30% dari total peserta" (basis: semua peserta)
Tabel 2: "30% dari peserta lulus" (basis: cuma yang lulus)
→ Nilai absolut-nya bisa beda jauh!

### Tabel dengan Data Kosong atau N/A

Kadang ada sel yang kosong, dikasih tanda "-" atau "N/A". Artinya:
- **Data tidak tersedia** (belum diukur/dicatat)
- **Tidak berlaku** (misal: penjualan produk yang belum diluncurkan)
- **Nilai nol** (tergantung konteks)

**Hati-hati:** Kosong ≠ otomatis nol! Baca keterangan dengan seksama.

### Master Tips: Speed Reading Tabel

⚡ **Tip #1: Scan Struktur Dulu**
Sebelum baca detail, liat dulu struktur umumnya:
- Berapa kolom? Berapa baris?
- Ada sub-kategori nggak?
- Ada total/subtotal nggak?

⚡ **Tip #2: Mark the Territory**
Kalau di kertas, bisa coret-coret atau lingkari header yang relevan. Kalau di layar, gunakan jari untuk "nge-mark" area yang kamu baca.

⚡ **Tip #3: Calculate as You Go**
Kalau soalnya nanya beberapa hal, jangan tunggu semua dibaca. Hitung satu-satu sambil jalan.

⚡ **Tip #4: Use Process of Elimination**
Kalau soal pilihan ganda, kadang kamu bisa eliminasi jawaban tanpa hitung lengkap. Misal: "Pasti lebih dari 100" → eliminasi pilihan A-C yang di bawah 100.

### Latihan Mental: Bacaan Tabel Cepat

Biasain diri untuk:
1. **Baca judul** - 2 detik
2. **Scan header** - 3 detik
3. **Identifikasi data relevan** - 5 detik
4. **Baca & proses** - 10-15 detik
5. **Double check** - 5 detik

Total: sekitar 25-30 detik per tabel sederhana. Practice makes perfect!

---
