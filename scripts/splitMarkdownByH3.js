const fs = require('fs');
const path = require('path');

/**
 * Script untuk memisahkan file markdown menjadi file-file terpisah berdasarkan heading ### (H3)
 * Setiap heading ### akan menjadi file baru dengan nama dari judul heading tersebut
 */

// Folder-folder yang akan diproses
const MATERI_FOLDERS = ['LBI', 'LBE', 'PM', 'PK', 'PBM', 'PPU'];
const BASE_PATH = path.join(__dirname, '..', '__temp__', 'materi');

/**
 * Membersihkan nama file dari karakter yang tidak diperbolehkan
 */
function sanitizeFileName(fileName) {
  return fileName
    .replace(/[<>:"/\\|?*]/g, '') // Hapus karakter ilegal Windows
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Memisahkan konten markdown berdasarkan heading ###
 */
function splitMarkdownByH3(content) {
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
      currentSection = {
        title: title,
        content: headerLines.length > 0 ? [...headerLines, line] : [line]
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
  
  return sections;
}

/**
 * Memproses satu file markdown
 */
function processMarkdownFile(filePath, outputDir) {
  console.log(`\nMemproses file: ${filePath}`);
  
  // Baca file
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Split berdasarkan H3
  const sections = splitMarkdownByH3(content);
  
  console.log(`Ditemukan ${sections.length} section dengan heading ###`);
  
  // Buat file untuk setiap section
  sections.forEach((section, index) => {
    const fileName = sanitizeFileName(section.title) + '.md';
    const outputPath = path.join(outputDir, fileName);
    
    // Gabungkan content menjadi string
    const fileContent = section.content.join('\n');
    
    // Tulis file
    fs.writeFileSync(outputPath, fileContent, 'utf-8');
    console.log(`  ✓ Dibuat: ${fileName}`);
  });
  
  return sections.length;
}

/**
 * Memproses semua folder secara rekursif
 */
function processFolder(folderPath) {
  let totalFiles = 0;
  let totalSections = 0;
  
  // Cek apakah folder ada
  if (!fs.existsSync(folderPath)) {
    console.log(`Folder tidak ditemukan: ${folderPath}`);
    return { files: 0, sections: 0 };
  }
  
  // Baca isi folder
  const items = fs.readdirSync(folderPath);
  
  items.forEach(item => {
    const itemPath = path.join(folderPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Rekursif untuk subfolder
      const result = processFolder(itemPath);
      totalFiles += result.files;
      totalSections += result.sections;
    } else if (item.endsWith('.md')) {
      // Proses file markdown
      const sections = processMarkdownFile(itemPath, folderPath);
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
  console.log('='.repeat(60));
  console.log('Script Pemisahan File Markdown Berdasarkan Heading ###');
  console.log('='.repeat(60));
  
  let grandTotalFiles = 0;
  let grandTotalSections = 0;
  
  MATERI_FOLDERS.forEach(folder => {
    const folderPath = path.join(BASE_PATH, folder);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Memproses folder: ${folder}`);
    console.log('='.repeat(60));
    
    const result = processFolder(folderPath);
    grandTotalFiles += result.files;
    grandTotalSections += result.sections;
    
    console.log(`\nRingkasan ${folder}:`);
    console.log(`  - File yang diproses: ${result.files}`);
    console.log(`  - Section yang dibuat: ${result.sections}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('RINGKASAN TOTAL');
  console.log('='.repeat(60));
  console.log(`Total file yang diproses: ${grandTotalFiles}`);
  console.log(`Total section yang dibuat: ${grandTotalSections}`);
  console.log('\n✓ Proses selesai!');
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

module.exports = { splitMarkdownByH3, sanitizeFileName };
