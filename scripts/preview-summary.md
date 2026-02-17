# Summary Preview - Split Markdown Results

## 📊 Statistik Total
- **Total file diproses**: 118 file
- **Total section yang akan dibuat**: 1,374 file baru
- **Mode**: DRY RUN (preview only)
- **File original**: AKAN DIPERTAHANKAN (default)

---

## 📁 Breakdown Per Folder

### LBI (Literasi Bahasa Indonesia)
- File diproses: 19
- Section ditemukan: 230

### LBE (Literasi Bahasa Inggris) 
- File diproses: 20
- Section ditemukan: 221

**Contoh: LBE/4.6/4.6.md** ✨ (file yang sedang kamu buka)
Auto-detect: Split by **H3** (5 materi ditemukan)
File yang akan dibuat:
1. `MATERI 4.6.1 PENGENALAN SUMMARY QUESTIONS (Materi Dibuka).md`
2. `MATERI 4.6.2 ANALISIS SUMMARY UNTUK SINGLE PARAGRAPH.md`
3. `MATERI 4.6.3 ANALISIS SUMMARY UNTUK MULTI-PARAGRAPH TEXT.md`
4. `MATERI 4.6.4 ANALISIS SUMMARY OPTIONS.md`
5. `MATERI 4.6.5 DISTINGUISHING MAIN POINTS DARI SUPPORTING DETAILS.md`

### PM (Penalaran Matematika)
- File diproses: 24
- Section ditemukan: 340

### PK (Pengetahuan Kuantitatif)
- File diproses: 27
- Section ditemukan: 293

### PBM
- File diproses: 9
- Section ditemukan: 60

### PPU (Pengetahuan dan Pemahaman Umum)
- File diproses: 19
- Section ditemukan: 330

---

## 🎯 Contoh Hasil di Folder 4.6

### Before:
```
LBE/4.6/
  └── 4.6.md (1 file besar)
```

### After (setelah run script):
```
LBE/4.6/
  ├── 4.6.md (FILE ORIGINAL - TETAP ADA!)
  ├── MATERI 4.6.1 PENGENALAN SUMMARY QUESTIONS (Materi Dibuka).md
  ├── MATERI 4.6.2 ANALISIS SUMMARY UNTUK SINGLE PARAGRAPH.md
  ├── MATERI 4.6.3 ANALISIS SUMMARY UNTUK MULTI-PARAGRAPH TEXT.md
  ├── MATERI 4.6.4 ANALISIS SUMMARY OPTIONS.md
  └── MATERI 4.6.5 DISTINGUISHING MAIN POINTS DARI SUPPORTING DETAILS.md
```

---

## 🔍 Contoh Auto-detect di Berbagai File

| File | Detected Level | Materi Count | Total Heading |
|------|----------------|--------------|---------------|
| LBI/1.1.md | H3 (###) | 12 materi | 82 sections |
| LBI/1.2.md | H2 (##) | 5 materi | 5 sections |
| LBE/1.1.md | H3 (###) | 5 materi | 5 sections |
| LBE/1.2.md | H3 (###) | 5 materi | 56 sections |
| LBE/4.6.md | **H3 (###)** | **5 materi** | **5 sections** |
| PM/1.1.md | H3 (###) | 7 materi | 70 sections |

---

## ✅ Kesimpulan Preview

✨ **Script berjalan dengan baik!**
- Auto-detect bekerja sempurna (deteksi H2 atau H3)
- Tidak ada error
- Total 1,374 file baru akan dibuat
- File original tetap aman (tidak dihapus)
- Backup akan dibuat otomatis sebelum proses

## 🚀 Next Step

Untuk menjalankan proses sebenarnya:
```bash
node scripts/splitMarkdownFlexible.js
```

File akan dibuat dengan struktur:
- ✅ Backup disimpan di `__temp__/backup_materi/`
- ✅ File original tetap ada
- ✅ File baru dibuat untuk setiap materi
