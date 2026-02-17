const fs = require('fs');
const path = require('path');

/**
 * Script fleksibel untuk memisahkan file markdown berdasarkan heading ## atau ###
 * Bisa mendeteksi otomatis atau set manual level heading yang diinginkan
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
 * Deteksi level heading yang paling cocok untuk split (## atau ###)
 * HANYA menghitung heading yang mengandung kata "Materi" 
 * TAPI BUKAN yang mengandung kata "Rangkuman", "Kesimpulan", "Ringkasan", "Penutup"
 */
function detectSplitLevel(content) {
  const lines = content.split('\n');
  let h2MateriCount = 0;
  let h3MateriCount = 0;
  
  const excludeKeywords = ['rangkuman', 'kesimpulan', 'ringkasan', 'penutup'];
  
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    
    // Skip jika mengandung kata exclude
    if (excludeKeywords.some(keyword => lowerLine.includes(keyword))) {
      return;
    }
    
    // Cek H2 (## tapi bukan ### atau lebih) yang ada kata "Materi"
    if (line.match(/^## [^#]/) && lowerLine.includes('materi')) {
      h2MateriCount++;
    }
    // Cek H3 (### tapi bukan #### atau lebih) yang ada kata "Materi"
    else if (line.match(/^### [^#]/) && lowerLine.includes('materi')) {
      h3MateriCount++;
    }
  });
  
  // Prioritas: yang paling banyak kata "Materi" (excluding rangkuman/kesimpulan)
  if (h2MateriCount > h3MateriCount) {
    return { level: 2, count: h2MateriCount, materiCount: h2MateriCount };
  } else if (h3MateriCount > 0) {
    return { level: 3, count: h3MateriCount, materiCount: h3MateriCount };
  } else if (h2MateriCount > 0) {
    return { level: 2, count: h2MateriCount, materiCount: h2MateriCount };
  } else {
    // Fallback jika tidak ada yang punya "Materi", gunakan H3
    return { level: 3, count: 0, materiCount: 0 };
  }
}

/**
 * Memisahkan konten markdown berdasarkan heading level tertentu
 * HANYA split heading yang mengandung kata "Materi" (case insensitive)
 */
function splitMarkdownByHeading(content, splitLevel = 3, includeHeaders = true) {
  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;
  let headerLines = [];
  
  // Regex pattern berdasarkan level
  const splitPattern = splitLevel === 2 
    ? /^## [^#]/ // H2 tapi bukan H3+
    : /^### [^#]/; // H3 tapi bukan H4+
  
  const headerPattern = splitLevel === 2
    ? /^# [^#]/ // Hanya H1 yang jadi header kalau split by H2
    : /^##? [^#]/; // H1 dan H2 jadi header kalau split by H3
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Cek apakah ini adalah heading yang akan di-split DAN mengandung "Materi"
    if (splitPattern.test(line) && line.toLowerCase().includes('materi')) {
      // Simpan section sebelumnya jika ada
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Mulai section baru
      const hashCount = splitLevel === 2 ? 2 : 3;
      const title = line.replace(new RegExp(`^${'#'.repeat(hashCount)} `), '').replace(/\*\*/g, '').trim();
      
      // Tentukan apakah include header atau tidak
      const sectionContent = includeHeaders && headerLines.length > 0 
        ? [...headerLines, '', line] // Tambah blank line untuk pemisah
        : [line];
      
      currentSection = {
        title: title,
        rawTitle: line,
        content: sectionContent,
        level: splitLevel
      };
    } else if (headerPattern.test(line)) {
      // Simpan header untuk dimasukkan ke semua section
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
  const { 
    dryRun = false, 
    includeHeaders = true, 
    keepOriginal = true, // Default: keep original file
    splitLevel = 'auto' // 'auto', 2, atau 3
  } = options;
  
  console.log(`\n📄 Memproses: ${path.basename(filePath)}`);
  
  // Baca file
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Deteksi level jika auto
  let actualSplitLevel = splitLevel;
  if (splitLevel === 'auto') {
    const detection = detectSplitLevel(content);
    actualSplitLevel = detection.level;
    console.log(`   🔍 Auto-detect: Split by H${detection.level} (${detection.materiCount} materi, ${detection.count} total heading)`);
  } else {
    console.log(`   📌 Split level: H${actualSplitLevel}`);
  }
  
  // Split berdasarkan level
  const { sections, headers } = splitMarkdownByHeading(content, actualSplitLevel, includeHeaders);
  
  console.log(`   ✓ Ditemukan ${sections.length} section`);
  
  if (dryRun) {
    console.log('   [DRY RUN] File yang akan dibuat:');
    sections.forEach((section, index) => {
      const fileName = sanitizeFileName(section.title) + '.md';
      console.log(`     ${index + 1}. ${fileName}`);
    });
    return sections.length;
  }
  
  // Buat file untuk setiap section
  let createdCount = 0;
  let skippedCount = 0;
  
  sections.forEach((section, index) => {
    const fileName = sanitizeFileName(section.title) + '.md';
    const outputPath = path.join(outputDir, fileName);
    
    // Gabungkan content menjadi string
    const fileContent = section.content.join('\n');
    
    // Cek apakah file sudah ada
    if (fs.existsSync(outputPath)) {
      console.log(`     ⚠ Sudah ada: ${fileName}`);
      skippedCount++;
      return;
    }
    
    // Tulis file
    fs.writeFileSync(outputPath, fileContent, 'utf-8');
    console.log(`     ✓ Dibuat: ${fileName}`);
    createdCount++;
  });
  
  if (createdCount > 0 || skippedCount > 0) {
    console.log(`   📊 Hasil: ${createdCount} dibuat, ${skippedCount} dilewati`);
  }
  
  // Hapus file original jika diminta (dengan flag --delete-original) dan ada file yang dibuat
  if (!keepOriginal && createdCount > 0) {
    fs.unlinkSync(filePath);
    console.log(`   🗑 File original dihapus`);
  } else if (createdCount > 0) {
    console.log(`   💾 File original dipertahankan`);
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
  const deleteOriginal = args.includes('--delete-original') || args.includes('-D'); // Flag untuk hapus original
  const keepOriginal = !deleteOriginal; // Default: keep original kecuali ada flag delete
  const noHeaders = args.includes('--no-headers');
  const help = args.includes('--help') || args.includes('-h');
  
  // Parse split level
  let splitLevel = 'auto';
  const h2Index = args.indexOf('--h2');
  const h3Index = args.indexOf('--h3');
  
  if (h2Index !== -1) {
    splitLevel = 2;
  } else if (h3Index !== -1) {
    splitLevel = 3;
  }
  
  if (help) {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║   Split Markdown by Heading - Flexible Version            ║
╚════════════════════════════════════════════════════════════╝

Penggunaan: node splitMarkdownFlexible.js [options]

Split Level Options:
  --h2                 Force split by heading ## (H2)
  --h3                 Force split by heading ### (H3)
  (default: auto)      Auto-detect level yang paling cocok

General Options:
  -d, --dry-run        Preview saja, tidak membuat file
  -D, --delete-original  Hapus file original setelah split (default: keep)kan)
  -k, --keep-original  Jangan hapus file original
  --no-headers         Jangan include parent headers
  -h, --help           Tampilkan help ini

Contoh Penggunaan:
  node splitMarkdownFlexible.js --dry-run      # Preview dengan auto-detect
  node splitMarkdownFlexible.js --h2           # Force split by H2 (keep original)
  node splitMarkdownFlexible.js --h3 -D        # Split by H3, delete original
  node splitMarkdownFlexible.js --h2 --dry-run # Preview split by H2

Auto-detect Logic:
  1. Hitung heading ## dan ### yang ada
  2. Prioritas: heading dengan kata "Materi" terbanyak
  3. Jika sama, pilih yang headingnya lebih banyak

Folder yang Diproses:
  - __temp__/materi/LBI/
  - __temp__/materi/LBE/
  - __temp__/materi/PM/
  - __temp__/materi/PK/
  - __temp__/materi/PBM/
  - __temp__/materi/PPU/
`);
    return;
  }
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Split Markdown by Heading - Flexible Version            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  if (dryRun) {
    console.log('\n⚠️  MODE: DRY RUN (preview saja)');
  }
  
  console.log(`📏 Split Level: ${splitLevel === 'auto' ? 'AUTO-DETECT' : 'H' + splitLevel}`);
  console.log(`💾 File original: ${keepOriginal ? 'AKAN DIPERTAHANKAN (default)' : 'AKAN DIHAPUS'}`);
  
  if (deleteOriginal) {
    console.log('⚠️  File original akan dihapus setelah split');
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
    keepOriginal,
    splitLevel
  };
  
  MATERI_FOLDERS.forEach(folder => {
    const folderPath = path.join(BASE_PATH, folder);
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📁 Folder: ${folder}`);
    console.log('═'.repeat(60));
    
    const result = processFolder(folderPath, options);
    grandTotalFiles += result.files;
    grandTotalSections += result.sections;
    
    if (result.files > 0) {
      console.log(`\n📊 Ringkasan ${folder}:`);
      console.log(`   • File diproses: ${result.files}`);
      console.log(`   • Section ditemukan: ${result.sections}`);
    } else {
      console.log(`   ℹ️  Tidak ada file .md di folder ini`);
    }
  });
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 RINGKASAN TOTAL');
  console.log('═'.repeat(60));
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

module.exports = { 
  splitMarkdownByHeading, 
  sanitizeFileName, 
  createBackup,
  detectSplitLevel
};
