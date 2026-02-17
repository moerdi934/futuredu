# Script Pemisahan File Markdown

Script untuk memisahkan file markdown menjadi file-file terpisah berdasarkan heading level 3 (###).

## 📁 File Script

1. **splitMarkdownByH3.js** - Script dasar untuk split markdown (hanya H3)
2. **splitMarkdownSafe.js** - Script dengan fitur backup dan safe mode (hanya H3)
3. **splitMarkdownFlexible.js** - Script fleksibel yang bisa H2 atau H3 dengan auto-detect ⭐ **RECOMMENDED**

## 🚀 Cara Penggunaan

### Script Fleksibel (splitMarkdownFlexible.js) ⭐ RECOMMENDED

Script ini bisa menangani heading ## (H2) atau ### (H3) dengan auto-detect!

#### Auto-detect (Default - Paling Mudah!)
```bash
node scripts/splitMarkdownFlexible.js --dry-run
```

Script akan otomatis mendeteksi apakah file lebih cocok di-split berdasarkan H2 atau H3 dengan logika:
1. Menghitung heading ## dan ### yang ada
2. Prioritas: heading dengan kata "Materi" terbanyak
3. Jika sama, pilih yang headingnya lebih banyak

#### Force Split by H2
```bash
node scripts/splitMarkdownFlexible.js --h2
```
Paksa split berdasarkan heading ## (H2), cocok untuk file yang materinya di H2.

#### Force Split by H3
```bash
node scripts/splitMarkdownFlexible.js --h3
```
Paksa split berdasarkan heading ### (H3), cocok untuk file yang materinya di H3.

#### Contoh Kombinasi
```bash
# Preview dengan auto-detect
node scripts/splitMarkdownFlexible.js --dry-run

# Jalankan dengan H2 (keep original - default)
node scripts/splitMarkdownFlexible.js --h2

# Jalankan dengan H2, hapus original
node scripts/splitMarkdownFlexible.js --h2 --delete-original

# Preview dengan H3
node scripts/splitMarkdownFlexible.js --h3 --dry-run

# Jalankan H2 tanpa backup dan hapus original (not recommended)
node scripts/splitMarkdownFlexible.js --h2 --no-backup --delete-original
```

---

### Script Dasar (splitMarkdownByH3.js)

```bash
node scripts/splitMarkdownByH3.js
```

Script ini akan:
- Memproses semua file .md di folder LBI, LBE, PM, dan PK
- Memisahkan berdasarkan heading ### 
- Membuat file baru untuk setiap section
- Menyimpan file di folder yang sama dengan file original

### Script Safe Mode (splitMarkdownSafe.js) - Hanya H3

Script ini hanya untuk heading ### (H3). Gunakan splitMarkdownFlexible.js untuk H2.

#### Preview Dulu (Dry Run)
```bash
node scripts/splitMarkdownSafe.js --dry-run
```
atau
```bash
node scripts/splitMarkdownSafe.js -d
```

Ini akan menampilkan preview file apa saja yang akan dibuat tanpa benar-benar membuat file.

#### Jalankan dengan Backup (Default)
```bash
node scripts/splitMarkdownSafe.js
```

Ini akan:
1. Membuat backup semua file ke `__temp__/backup_materi/`
2. Memproses semua file
3. Membuat file-file baru
4. **File original tetap ada** (default behavior)

#### Opsi Lainnya

**Hapus file original setelah split:**
```bash
node scripts/splitMarkdownSafe.js --delete-original
```
atau
```bash
node scripts/splitMarkdownSafe.js -D
```

**Skip backup (tidak disarankan):**
```bash
node scripts/splitMarkdownSafe.js --no-backup
```

**Jangan include header (# dan ##):**
```bash
node scripts/splitMarkdownSafe.js --no-headers
```

**Kombinasi opsi:**
```bash
node scripts/splitMarkdownSafe.js --dry-run --no-headers
node scripts/splitMarkdownSafe.js --delete-original --no-backup
```

**Lihat help:**
```bash
node scripts/splitMarkdownSafe.js --help
```

## 📋 Contoh Output

### Contoh 1: File dengan Materi di H3 (###)

### Input (file 3.1.md):
```markdown
# SECTION 3: Geometri dan Pengukuran
## Topic 3.1: Geometri Bidang Datar

### Materi 3.1.1: Pengenalan Bangun Datar
Konten materi 3.1.1...

### Materi 3.1.2: Segitiga
Konten materi 3.1.2...

### Materi 3.1.3: Segiempat
Konten materi 3.1.3...
```

### Output (3 file terpisah):

**Materi 3.1.1: Pengenalan Bangun Datar.md**
```markdown
# SECTION 3: Geometri dan Pengukuran
## Topic 3.1: Geometri Bidang Datar

### Materi 3.1.1: Pengenalan Bangun Datar
Konten materi 3.1.1...
```

**Materi 3.1.2: Segitiga.md**
```markdown
# SECTION 3: Geometri dan Pengukuran
## Topic 3.1: Geometri Bidang Datar

### Materi 3.1.2: Segitiga
Konten materi 3.1.2...
```

**Materi 3.1.3: Segiempat.md**
```markdown
# SECTION 3: Geometri dan Pengukuran
## Topic 3.1: Geometri Bidang Datar

### Materi 3.1.3: Segiempat
Konten materi 3.1.3...
```

---

### Contoh 2: File dengan Materi di H2 (##)

#### Input (file 4.1.md):
```markdown
# SECTION 4: Statistika

## Materi 4.1.1: Pengenalan Data
Konten materi 4.1.1...

## Materi 4.1.2: Diagram Batang
Konten materi 4.1.2...

## Materi 4.1.3: Diagram Lingkaran
Konten materi 4.1.3...
```

#### Output (3 file terpisah):

**Materi 4.1.1: Pengenalan Data.md**
```markdown
# SECTION 4: Statistika

## Materi 4.1.1: Pengenalan Data
Konten materi 4.1.1...
```

**Materi 4.1.2: Diagram Batang.md**
```markdown
# SECTION 4: Statistika

## Materi 4.1.2: Diagram Batang
Konten materi 4.1.2...
```

**Materi 4.1.3: Diagram Lingkaran.md**
```markdown
# SECTION 4: Statistika

## Materi 4.1.3: Diagram Lingkaran
Konten materi 4.1.3...
```

## 🎯 Folder yang Diproses

Script akan memproses semua file .md di folder-folder berikut secara rekursif:
- `__temp__/materi/LBI/`
- `__temp__/materi/LBE/`
- `__temp__/materi/PM/`
- `__temp__/materi/PK/`
- `__temp__/materi/PBM/`
- `__temp__/materi/PPU/`

## ⚙️ Cara Kerja

### splitMarkdownFlexible.js (AUTO-DETECT)
1. Baca file markdown
2. **Auto-detect**: Analisis heading ## dan ### mana yang lebih banyak kata "Materi"
3. Split berdasarkan heading yang terdeteksi (atau force dengan --h2 atau --h3)
4. Header parent (# atau ## tergantung split level) dimasukkan ke setiap file
5. Nama file dibuat dari judul heading
6. File disimpan di folder yang sama dengan file original

### splitMarkdownSafe.js & splitMarkdownByH3.js (HANYA H3)
1. Script membaca file markdown
2. Mencari semua heading level 3 (###)
3. Memisahkan konten berdasarkan heading tersebut
4. Header (# dan ##) akan dimasukkan ke setiap file (opsional)
5. Nama file dibuat dari judul heading (karakter ilegal dihapus)
6. File disimpan di folder yang sama dengan file original
**File original akan tetap ada** (kecuali pakai flag `--delete-original`)
- Karakter yang tidak diperbolehkan di nama file Windows akan dihapus otomatis: `< > : " / \ | ? *`
- Panjang nama file dibatasi 200 karakter
- Jika file dengan nama yang sama sudah ada, akan dilewati (tidak overwrite)
- Format markdown seperti `**bold**` akan dihapus dari nama file
- Tag `(GRATIS)` akan dipertahankan tapi format markdown-nya dibersihkan
- Di folder akan ada: **file original + file-file materi baru** (misal: `4.6.md` + `Materi 4.6.1.md` + `Materi 4.6.2.md`)
- Jika file dengan nama yang sama sudah ada, akan dilewati (tidak overwrite)
- Format markdown seperti `**bold**` akan dihapus dari nama file
- Tag `(GRATIS)` akan dipertahankan tapi format markdown-nya dibersihkan

## 🔒 Keamanan Data

**Script Safe Mode** membuat backup otomatis sebelum proses:
- Backup disimpan di `__temp__/backup_materi/`
- Struktur folder backup sama dengan original
- Gunakan `--no-backup` hanya jika yakin (tidak disarankan)

## 💡 Tips

1. **Selalu gunakan --dry-run dulu** untuk melihat preview
2. **Gunakan splitMarkdownFlexible.js** untuk handling H2 dan H3 otomatis ⭐
3. **Default behavior: file original TETAP ADA** (safe!)
7. **Gunakan --delete-original** hanya jika yakin ingin hapus file aslikata "Materi" di heading
4. **Gunakan --h2 atau --h3** jika auto-detect salah deteksi
5. **Check backup folder** setelah proses selesai
6. **Gunakan --keep-original** jika masih ragu-ragu

## 🔍 Kapan Pakai Script Mana?

| Script | Kapan Digunakan |
|--------|-----------------|
| **splitMarkdownFlexible.js** | ✅ **RECOMMENDED** - Pakai ini untuk semua kasus! Auto-detect H2/H3 |
| splitMarkdownSafe.js | Hanya jika 100% yakin materinya di H3 |
| splitMarkdownByH3.js | Legacy script, pakai flexible.js saja |

## 📊 Auto-detect Logic (splitMarkdownFlexible.js)

Script akan menganalisis file dengan prioritas:
1. **Prioritas Tertinggi**: Heading dengan kata "Materi" terbanyak
2. **Prioritas Kedua**: Heading yang jumlahnya lebih banyak

Contoh:
```
File A:
- ## Materi 1.1, ## Materi 1.2  → Split by H2 ✓
- ### Sub A, ### Sub B

File B:
- ## Topic 1, ## Topic 2
- ### Materi 1.1, ### Materi 1.2  → Split by H3 ✓
```

## 🐛 Troubleshooting

**Error: "Cannot find module 'fs'"**
- Pastikan menggunakan Node.js versi 12 atau lebih baru

**Error: "ENOENT: no such file or directory"**
- Pastikan menjalankan script dari root folder project
- Pastikan folder `__temp__/materi/` ada

**Nama file terlalu panjang**
- Script otomatis memotong nama file maksimal 200 karakter
- Jika masih error, edit manual nilai di `substring(0, 200)`

**File tidak terbuat**
- Check apakah file dengan nama sama sudah ada (akan dilewati)
- Check permission folder

## 📞 Support

Jika ada masalah, check:
1. Apakah Node.js sudah terinstall? (`node --version`)
2. Apakah script dijalankan dari root project?
3. Apakah folder `__temp__/materi/` ada dan berisi file .md?

## 📦 Dependencies

Script ini hanya menggunakan built-in Node.js modules:
- `fs` - File system operations
- `path` - Path utilities

Tidak ada external dependencies, jadi tidak perlu `npm install`.
