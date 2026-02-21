// pages/api/upload/image.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Disable Next.js body parsing for file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Upload image to Cloudinary CDN
 * POST /api/upload/image
 * 
 * Accepts: multipart/form-data with 'image' field
 * Returns: { url: string, public_id: string }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB max
      keepExtensions: true,
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      }
    );

    // Get the uploaded file
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
    
    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Validate file type
    if (!imageFile.mimetype?.startsWith('image/')) {
      return res.status(400).json({ error: 'File must be an image' });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageFile.filepath, {
      folder: 'futuredu/editor', // Organize uploads in a folder
      resource_type: 'auto',
      // Generate unique public_id with timestamp
      public_id: `editor_${Date.now()}`,
    });

    // Delete temporary file
    fs.unlinkSync(imageFile.filepath);

    // Return Cloudinary URL
    return res.status(200).json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      bytes: uploadResult.bytes,
    });

  } catch (error: any) {
    console.error('[Upload Image] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to upload image',
      details: error.message 
    });
  }
}
