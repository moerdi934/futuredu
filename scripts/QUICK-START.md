# Quick Reference - Split Markdown Scripts

## 🚀 Penggunaan Paling Mudah

```bash
# 1. Preview dulu (RECOMMENDED)
node scripts/splitMarkdownFlexible.js --dry-run

# 2. Jalankan (file original tetap ada!)
node scripts/splitMarkdownFlexible.js

# Done! 🎉
```

## 📊 Hasil

### Before (di folder 4.6):
```
4.6/
  └── 4.6.md (file besar dengan semua materi)
```

### After (di folder 4.6):
```
4.6/
  ├── 4.6.md (TETAP ADA - file original)
  ├── Materi 4.6.1: Judul Materi 1.md
  ├── Materi 4.6.2: Judul Materi 2.md
  └── Materi 4.6.3: Judul Materi 3.md
```

## ⚙️ Script Options

### Auto-detect H2 atau H3 (RECOMMENDED)
```bash
node scripts/splitMarkdownFlexible.js --dry-run
node scripts/splitMarkdownFlexible.js
```

### Force Split Level
```bash
# Force H2 (##)
node scripts/splitMarkdownFlexible.js --h2

# Force H3 (###)
node scripts/splitMarkdownFlexible.js --h3
```

### Advanced Options
```bash
# Hapus file original setelah split
node scripts/splitMarkdownFlexible.js --delete-original

# Skip backup (not recommended)
node scripts/splitMarkdownFlexible.js --no-backup

# Kombinasi
node scripts/splitMarkdownFlexible.js --h2 --delete-original
```

## 🎯 Folder yang Diproses

Script memproses semua file `.md` di:
- `__temp__/materi/LBI/`
- `__temp__/materi/LBE/`
- `__temp__/materi/PM/`
- `__temp__/materi/PK/`
- `__temp__/materi/PBM/`
- `__temp__/materi/PPU/`

## 🔒 Safety Features

✅ **Backup otomatis** sebelum proses  
✅ **File original tetap ada** (default)  
✅ **Dry-run mode** untuk preview  
✅ **Skip file yang sudah ada** (no overwrite)  
✅ **Backup location**: `__temp__/backup_materi/`

## 🆘 Troubleshooting

**Script tidak menemukan file?**
- Pastikan ada file `.md` di folder yang diproses
- Jalankan dari root folder project

**Auto-detect salah?**
- Gunakan `--h2` atau `--h3` untuk force level

**Mau rollback?**
- Restore dari folder backup: `__temp__/backup_materi/`

## 📖 Full Documentation

Lihat [README-SPLIT-MARKDOWN.md](README-SPLIT-MARKDOWN.md) untuk dokumentasi lengkap.
