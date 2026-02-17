const fs = require('fs');
const path = require('path');

/**
 * Script untuk memisahkan file markdown dengan fitur backup dan safe mode
 * Versi aman dari splitMarkdownByH3.js
 */

// Folder-folder yang akan diproses
const MATERI_FOLDERS = ['LBI', 'LBE', 'PM', 'PK', 'PBM', 'PPU'];
const BASE_PATH = path.join(__dirname, '..', '__temp__', 'materi');
const BACKUP_PATH = path.join(__dirname, '..', '__temp__', 'backup_materi');

/**
 * Membersihkan nama file dari karakter yang tidak diperbolehkan
 */
function sanitizeFileName(fileName) {
  return fileName
    .replace(/[<>:"/\\|?*]/g, '') // Hapus karakter ilegal Windows
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\*\s*\(GRATIS\)\*/gi, '(GRATIS)') // Bersihkan format markdown GRATIS
    .replace(/\*\*/g, '') // Hapus bold
    .trim()
    .substring(0, 200); // Batasi panjang nama file
}

/**
 * Membuat backup folder
 */
function createBackup(sourcePath, backupPath) {
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }
  
  const items = fs.readdirSync(sourcePath);
  
  items.forEach(item => {
    const sourceItem = path.join(sourcePath, item);
    const backupItem = path.join(backupPath, item);
    const stat = fs.statSync(sourceItem);
    
    if (stat.isDirectory()) {
      createBackup(sourceItem, backupItem);
    } else {
      fs.copyFileSync(sourceItem, backupItem);
    }
  });
}

/**
 * Memisahkan konten markdown berdasarkan heading ###
 */
function splitMarkdownByH3(content, includeHeaders = true) {
  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;
  let headerLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Cek apakah ini adalah heading ### (bukan #### atau lebih)
    if (line.match(/^### /)) {
      // Simpan section sebelumnya jika ada
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Mulai section baru
      const title = line.replace(/^### /, '').replace(/\*\*/g, '').trim();
      
      // Tentukan apakah include header atau tidak
      const sectionContent = includeHeaders && headerLines.length > 0 
        ? [...headerLines, '', line] // Tambah blank line untuk pemisah
        : [line];
      
      currentSection = {
        title: title,
        rawTitle: line,
        content: sectionContent
      };
    } else if (line.match(/^# /) || line.match(/^## /)) {
      // Simpan header (# dan ##) untuk dimasukkan ke semua section
      if (!currentSection) {
        headerLines.push(line);
      }
    } else {
      // Tambahkan line ke section saat ini
      if (currentSection) {
        currentSection.content.push(line);
      } else {
        // Jika belum ada section, tambahkan ke header
        headerLines.push(line);
      }
    }
  }
  
  // Simpan section terakhir
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return { sections, headers: headerLines };
}

/**
 * Memproses satu file markdown
 */
function processMarkdownFile(filePath, outputDir, options = {}) {
  const { dryRun = false, includeHeaders = true, keepOriginal = true } = options;
  
  console.log(`\nMemproses file: ${path.basename(filePath)}`);
  
  // Baca file
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Split berdasarkan H3
  const { sections, headers } = splitMarkdownByH3(content, includeHeaders);
  
  console.log(`  Ditemukan ${sections.length} section dengan heading ###`);
  
  if (dryRun) {
    console.log('  [DRY RUN] File yang akan dibuat:');
    sections.forEach((section, index) => {
      const fileName = sanitizeFileName(section.title) + '.md';
      console.log(`    ${index + 1}. ${fileName}`);
    });
    return sections.length;
  }
  
  // Buat file untuk setiap section
  let createdCount = 0;
  sections.forEach((section, index) => {
    const fileName = sanitizeFileName(section.title) + '.md';
    const outputPath = path.join(outputDir, fileName);
    
    // Gabungkan content menjadi string
    const fileContent = section.content.join('\n');
    
    // Cek apakah file sudah ada
    if (fs.existsSync(outputPath)) {
      console.log(`    ⚠ Sudah ada: ${fileName} (dilewati)`);
      return;
    }
    
    // Tulis file
    fs.writeFileSync(outputPath, fileContent, 'utf-8');
    console.log(`    ✓ Dibuat: ${fileName}`);
    createdCount++;
  });
  
  // Hapus file original jika diminta
  if (!keepOriginal && createdCount > 0) {
    fs.unlinkSync(filePath);
    console.log(`    🗑 File original dihapus: ${path.basename(filePath)}`);
  }
  
  return sections.length;
}

/**
 * Memproses semua folder secara rekursif
 */
function processFolder(folderPath, options = {}) {
  let totalFiles = 0;
  let totalSections = 0;
  
  // Cek apakah folder ada
  if (!fs.existsSync(folderPath)) {
    console.log(`  Folder tidak ditemukan: ${folderPath}`);
    return { files: 0, sections: 0 };
  }
  
  // Baca isi folder
  const items = fs.readdirSync(folderPath);
  
  items.forEach(item => {
    const itemPath = path.join(folderPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Rekursif untuk subfolder
      const result = processFolder(itemPath, options);
      totalFiles += result.files;
      totalSections += result.sections;
    } else if (item.endsWith('.md')) {
      // Proses file markdown
      const sections = processMarkdownFile(itemPath, folderPath, options);
      totalFiles++;
      totalSections += sections;
    }
  });
  
  return { files: totalFiles, sections: totalSections };
}

/**
 * Main function
 */
function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const noBackup = args.includes('--no-backup');
  const deleteOriginal = args.includes('--delete-original') || args.includes('-D');
  const keepOriginal = !deleteOriginal; // Default: keep original
  const noHeaders = args.includes('--no-headers');
  const help = args.includes('--help') || args.includes('-h');
  
  if (help) {
    console.log(`
Penggunaan: node splitMarkdownSafe.js [options]

Options:
  -d, --dry-run        Preview saja, tidak membuat file
  -D, --delete-original  Hapus file original setelah split (default: keep)
  --no-headers         Jangan include header (# dan ##) di setiap file
  -h, --help           Tampilkan help ini

Contoh:
  node splitMarkdownSafe.js                    # Jalankan dengan backup (keep original)
  node splitMarkdownSafe.js --dry-run          # Preview dulu
  node splitMarkdownSafe.js --delete-original  # Hapus file original setelah split
  node splitMarkdownSafe.js --keep-original    # Keep file original
`);
    return;
  }
  
  console.log('='.repeat(60));
  console.log('Script Pemisahan File Markdown (Safe Mode)');
  console.log('='.repeat(60));
  
  if (dryRun) {
    console.log('\n⚠️  MODE: DRY RUN (preview saja, tidak membuat file)');
  }
  
  if (keepOriginal) {
    console.log('ℹ️  File original akan tetap dipertahankan');
  }
  
  // Buat backup dulu jika tidak di-skip
  if (!dryRun && !noBackup) {
    console.log('\n📦 Membuat backup...');
    try {
      createBackup(BASE_PATH, BACKUP_PATH);
      console.log(`   ✓ Backup tersimpan di: ${BACKUP_PATH}`);
    } catch (error) {
      console.error(`   ❌ Gagal membuat backup: ${error.message}`);
      console.error('   Proses dibatalkan untuk keamanan data.');
      return;
    }
  }
  
  let grandTotalFiles = 0;
  let grandTotalSections = 0;
  
  const options = {
    dryRun,
    includeHeaders: !noHeaders,
    keepOriginal
  };
  
  MATERI_FOLDERS.forEach(folder => {
    const folderPath = path.join(BASE_PATH, folder);
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📁 Folder: ${folder}`);
    console.log('─'.repeat(60));
    
    const result = processFolder(folderPath, options);
    grandTotalFiles += result.files;
    grandTotalSections += result.sections;
    
    console.log(`\n  Ringkasan ${folder}:`);
    console.log(`    File diproses: ${result.files}`);
    console.log(`    Section ditemukan: ${result.sections}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RINGKASAN TOTAL');
  console.log('='.repeat(60));
  console.log(`Total file yang diproses: ${grandTotalFiles}`);
  console.log(`Total section yang dibuat: ${grandTotalSections}`);
  
  if (dryRun) {
    console.log('\n💡 Untuk menjalankan proses sebenarnya, jalankan tanpa --dry-run');
  } else {
    console.log('\n✅ Proses selesai!');
    if (!noBackup) {
      console.log(`📦 Backup tersimpan di: ${BACKUP_PATH}`);
    }
  }
}

// Jalankan script
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

module.exports = { splitMarkdownByH3, sanitizeFileName, createBackup };
