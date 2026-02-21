/**
 * Script to migrate base64 embedded images to Cloudinary CDN
 * 
 * This script:
 * 1. Finds all questions with embedded base64 images
 * 2. Extracts the images
 * 3. Uploads them to Cloudinary
 * 4. Replaces base64 URLs with Cloudinary URLs
 * 5. Updates the database
 */

const { v2: cloudinary } = require('cloudinary');
const { Pool } = require('pg');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: { rejectUnauthorized: false }, // Aiven requires SSL
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload base64 image to Cloudinary
 */
async function uploadToCloudinary(base64Data, questionId, imageIndex) {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'futuredu/questions',
      public_id: `question_${questionId}_img_${imageIndex}`,
      resource_type: 'image',
      overwrite: true,
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    });

    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload image for question ${questionId}:`, error);
    throw error;
  }
}

/**
 * Extract and replace base64 images with Cloudinary URLs
 */
async function processQuestionText(questionText, questionId) {
  const $ = cheerio.load(questionText);
  const imgElements = $('img[src^="data:image"]');
  
  let imagesProcessed = 0;

  for (let i = 0; i < imgElements.length; i++) {
    const img = imgElements.eq(i);
    const base64Src = img.attr('src');

    if (!base64Src) continue;

    try {
      console.log(`  Processing image ${i + 1}/${imgElements.length} for question ${questionId}...`);
      
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(base64Src, questionId, i);
      
      // Replace src attribute
      img.attr('src', cloudinaryUrl);
      
      imagesProcessed++;
      console.log(`  ✓ Uploaded: ${cloudinaryUrl}`);
    } catch (error) {
      console.error(`  ✗ Failed to process image ${i + 1} for question ${questionId}`);
      throw error;
    }
  }

  return {
    updatedText: $.html(),
    imagesProcessed,
  };
}

/**
 * Update question in database
 */
async function updateQuestion(questionId, newText) {
  try {
    await pool.query(
      'UPDATE questions SET question_text = $1, edit_date = NOW() WHERE id = $2',
      [newText, questionId]
    );
  } catch (error) {
    console.error(`Failed to update question ${questionId} in database:`, error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function migrateImagesToCloudinary(dryRun = false) {
  const stats = {
    totalQuestions: 0,
    totalImages: 0,
    successfulUploads: 0,
    failedUploads: 0,
    updatedQuestions: 0,
    errors: [],
  };

  try {
    console.log('🚀 Starting image migration to Cloudinary...\n');
    console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'PRODUCTION'}\n`);

    // Find all questions with embedded images
    const result = await pool.query(
      "SELECT id, question_text FROM questions WHERE question_text ILIKE '%data:image%'"
    );

    const questions = result.rows;
    stats.totalQuestions = questions.length;

    console.log(`Found ${questions.length} questions with embedded images\n`);

    // Process each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      console.log(`\n[${i + 1}/${questions.length}] Processing question ID: ${question.id}`);

      try {
        const { updatedText, imagesProcessed } = await processQuestionText(
          question.question_text,
          question.id
        );

        stats.totalImages += imagesProcessed;
        stats.successfulUploads += imagesProcessed;

        if (!dryRun && imagesProcessed > 0) {
          await updateQuestion(question.id, updatedText);
          stats.updatedQuestions++;
          console.log(`  ✓ Database updated for question ${question.id}`);
        } else if (dryRun && imagesProcessed > 0) {
          console.log(`  ℹ DRY RUN: Would update question ${question.id}`);
        }
      } catch (error) {
        stats.failedUploads++;
        stats.errors.push({
          question_id: question.id,
          error: error.message || String(error),
        });
        console.error(`  ✗ Failed to process question ${question.id}`);
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total questions found:    ${stats.totalQuestions}`);
    console.log(`Total images found:       ${stats.totalImages}`);
    console.log(`Successful uploads:       ${stats.successfulUploads}`);
    console.log(`Failed uploads:           ${stats.failedUploads}`);
    console.log(`Questions updated:        ${stats.updatedQuestions}`);
    console.log('='.repeat(60));

    if (stats.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      stats.errors.forEach((err) => {
        console.log(`  Question ${err.question_id}: ${err.error}`);
      });
    }

    if (dryRun) {
      console.log('\nℹ️  This was a DRY RUN - no changes were made to the database');
    }

  } catch (error) {
    console.error('Fatal error during migration:', error);
    throw error;
  }

  return stats;
}

// Run the script
const isDryRun = process.argv.includes('--dry-run');

migrateImagesToCloudinary(isDryRun)
  .then(() => {
    console.log('\n✅ Migration completed successfully!');
    pool.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    pool.end();
    process.exit(1);
  });
