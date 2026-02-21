/**
 * Migration Script: Passage Images to Cloudinary CDN
 * 
 * This script migrates images in question_passages table to Cloudinary:
 * 1. Base64 embedded images → Upload to Cloudinary
 * 2. External URLs (e.g., ruangguru CDN) → Download & Upload to Cloudinary
 * 3. Replace all image sources with Cloudinary URLs
 * 
 * Usage:
 * - Dry run: node migrate-passage-images-to-cloudinary.js --dry-run
 * - Real migration: node migrate-passage-images-to-cloudinary.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const cheerio = require('cheerio');
const axios = require('axios');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }, // Aiven requires SSL
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DRY_RUN = process.argv.includes('--dry-run');

console.log('='.repeat(60));
console.log('Passage Images to Cloudinary Migration');
console.log('='.repeat(60));
console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (no changes)' : '✍️  REAL MIGRATION'}`);
console.log('='.repeat(60));

/**
 * Upload image to Cloudinary (from base64 or URL)
 */
async function uploadToCloudinary(imageSource, passageId, imageIndex, isBase64 = true) {
  try {
    const folder = 'futuredu/passages';
    const publicId = `passage_${passageId}_img_${imageIndex}`;

    let uploadResult;
    
    if (isBase64) {
      // Upload base64 image directly
      uploadResult = await cloudinary.uploader.upload(imageSource, {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: 'auto',
      });
    } else {
      // Download external URL and upload
      console.log(`   📥 Downloading from external URL...`);
      const response = await axios.get(imageSource, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const buffer = Buffer.from(response.data);
      const base64Image = `data:${response.headers['content-type']};base64,${buffer.toString('base64')}`;
      
      uploadResult = await cloudinary.uploader.upload(base64Image, {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: 'auto',
      });
    }

    return {
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
    };
  } catch (error) {
    console.error(`   ❌ Upload failed:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Process passage text: extract images and upload to Cloudinary
 */
async function processPassageText(passageId, passageText) {
  const $ = cheerio.load(passageText);
  const images = $('img');
  
  if (images.length === 0) {
    return { modified: false, html: passageText, uploads: [] };
  }

  console.log(`   📷 Found ${images.length} image(s)`);
  
  const uploads = [];
  let imageIndex = 0;

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const $img = $(img);
    const src = $img.attr('src');
    
    if (!src) continue;
    
    imageIndex++;
    const isBase64 = src.startsWith('data:image');
    const isExternal = src.startsWith('http://') || src.startsWith('https://');
    
    if (!isBase64 && !isExternal) {
      console.log(`   ⏭️  Skipping relative/invalid URL: ${src.substring(0, 50)}...`);
      continue;
    }

    const imageType = isBase64 ? 'Base64' : 'External URL';
    const displaySrc = isBase64 
      ? `${src.substring(0, 50)}...` 
      : src;
    
    console.log(`   🔄 Processing image ${imageIndex} (${imageType}): ${displaySrc}`);
    
    if (DRY_RUN) {
      console.log(`   ✅ [DRY RUN] Would upload to: futuredu/passages/passage_${passageId}_img_${imageIndex}`);
      uploads.push({ dryRun: true, type: imageType });
      continue;
    }

    // Real upload
    const result = await uploadToCloudinary(src, passageId, imageIndex, isBase64);
    
    if (result.success) {
      console.log(`   ✅ Uploaded: ${result.url}`);
      console.log(`      Size: ${(result.bytes / 1024).toFixed(2)} KB, Format: ${result.format}`);
      
      // Replace src with Cloudinary URL
      $img.attr('src', result.url);
      
      uploads.push({
        originalType: imageType,
        originalSrc: isBase64 ? `${src.substring(0, 100)}...` : src,
        cloudinaryUrl: result.url,
        publicId: result.publicId,
        format: result.format,
        bytes: result.bytes,
      });
    } else {
      console.log(`   ⚠️  Failed to upload image ${imageIndex}`);
      uploads.push({
        originalType: imageType,
        error: result.error,
      });
    }
  }

  return {
    modified: uploads.length > 0,
    html: $.html(),
    uploads,
  };
}

/**
 * Update passage in database
 */
async function updatePassage(passageId, newPassageText) {
  if (DRY_RUN) {
    console.log(`   [DRY RUN] Would update passage ${passageId}`);
    return true;
  }

  try {
    const query = `
      UPDATE question_passages 
      SET passage = $1, 
          update_date = NOW()
      WHERE id = $2
    `;
    await pool.query(query, [newPassageText, passageId]);
    return true;
  } catch (error) {
    console.error(`   ❌ Database update failed:`, error.message);
    return false;
  }
}

/**
 * Main migration function
 */
async function migrate() {
  try {
    // Get all passages with images
    const query = `
      SELECT id, title, passage 
      FROM question_passages 
      WHERE passage ILIKE '%<img%'
      ORDER BY id
    `;
    
    console.log('\n🔍 Querying passages with images...\n');
    const result = await pool.query(query);
    
    console.log(`📊 Found ${result.rows.length} passage(s) with images\n`);
    
    if (result.rows.length === 0) {
      console.log('✅ No passages to migrate. Done!');
      return;
    }

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    let totalImages = 0;

    for (const row of result.rows) {
      const { id, title, passage } = row;
      processedCount++;
      
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`📝 Passage ${processedCount}/${result.rows.length}`);
      console.log(`   ID: ${id}`);
      console.log(`   Title: ${title || '(no title)'}`);
      console.log(`${'─'.repeat(60)}`);

      try {
        const result = await processPassageText(id, passage);
        
        if (!result.modified) {
          console.log(`   ℹ️  No images to migrate`);
          continue;
        }

        totalImages += result.uploads.length;

        if (!DRY_RUN) {
          const updated = await updatePassage(id, result.html);
          if (updated) {
            successCount++;
            console.log(`   ✅ Passage updated successfully`);
          } else {
            errorCount++;
            console.log(`   ❌ Failed to update passage`);
          }
        } else {
          console.log(`   ✅ [DRY RUN] Would update passage`);
        }

      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error processing passage:`, error.message);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`Total passages processed: ${processedCount}`);
    console.log(`Total images migrated: ${totalImages}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log('='.repeat(60));
    
    if (DRY_RUN) {
      console.log('\n💡 This was a DRY RUN. No changes were made.');
      console.log('   Run without --dry-run flag to perform actual migration.');
    } else {
      console.log('\n✅ Migration completed!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
migrate().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
