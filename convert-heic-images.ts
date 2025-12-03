#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { galleryFiles } from '../shared/schema';
import { eq } from 'drizzle-orm';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Import ObjectStorageService from server
import { ObjectStorageService } from '../server/objectStorage';

async function convertHeicImages() {
  console.log('🔄 Starting HEIC to JPEG conversion...');
  
  try {
    // Use the existing ObjectStorageService instead of new client
    const objectStorageService = new ObjectStorageService();
    console.log('📦 Connected to object storage service');
    
    // Initialize database
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);
    console.log('🗄️ Connected to database');
    
    // Get all HEIC files from database
    const heicFiles = await db.select().from(galleryFiles).where(eq(galleryFiles.contentType, 'image/heic'));
    console.log(`📋 Found ${heicFiles.length} HEIC files to convert`);
    
    if (heicFiles.length === 0) {
      console.log('✅ No HEIC files to convert');
      return;
    }
    
    // Ensure gallery images directory exists
    const outputDir = 'public/gallery/images';
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`📁 Ensured directory exists: ${outputDir}`);
    
    let convertedCount = 0;
    
    for (const heicFile of heicFiles) {
      try {
        console.log(`\n🔄 Processing: ${heicFile.filename}`);
        
        // Download HEIC file from object storage
        console.log(`📥 Downloading: ${heicFile.originalPath}`);
        
        // Download HEIC file from object storage using correct pattern
        let downloadData: Buffer | null = null;
        let fileSize = 0;
        
        try {
          const downloadResult = await objectStorageService.downloadObject(heicFile.originalPath);
          console.log(`📊 Download result - ok: ${downloadResult.ok}, data size: ${downloadResult.data?.length || 0} bytes, error: ${downloadResult.error}`);
          
          if (downloadResult.ok && downloadResult.data) {
            downloadData = downloadResult.data;
            fileSize = downloadResult.data.length;
            console.log(`✅ Successfully downloaded ${heicFile.filename}: ${fileSize} bytes`);
          } else {
            console.error(`❌ Download failed for ${heicFile.filename}: ${downloadResult.error || 'Unknown error'}`);
            continue;
          }
        } catch (error) {
          console.error(`❌ Download exception for ${heicFile.filename}:`, error);
          continue;
        }
        
        if (!downloadData || fileSize <= 1) {
          console.error(`❌ Invalid download for ${heicFile.filename} (size: ${fileSize})`);
          continue;
        }
        
        // Generate output filename
        const jpegFilename = heicFile.filename.replace(/\.heic$/i, '.jpg');
        const outputPath = path.join(outputDir, jpegFilename);
        
        console.log(`🖼️ Converting to JPEG: ${jpegFilename}`);
        
        // Convert HEIC to JPEG using Sharp
        await sharp(downloadData)
          .jpeg({ quality: 85 })
          .toFile(outputPath);
        
        // Get file stats
        const stats = await fs.stat(outputPath);
        console.log(`✅ Converted successfully: ${stats.size} bytes`);
        
        // Update database record to point to local JPEG file
        await db
          .update(galleryFiles)
          .set({
            objectStorageUrl: `/gallery/images/${jpegFilename}`,
            contentType: 'image/jpeg',
            fileSize: stats.size.toString(),
            filename: jpegFilename,
            isConverted: 'true',
            localPath: outputPath
          })
          .where(eq(galleryFiles.id, heicFile.id));
        
        console.log(`🗄️ Updated database record for ${jpegFilename}`);
        convertedCount++;
        
      } catch (error) {
        console.error(`❌ Error processing ${heicFile.filename}:`, error);
        continue;
      }
    }
    
    console.log(`\n🎉 Conversion complete!`);
    console.log(`✅ Successfully converted: ${convertedCount}/${heicFiles.length} files`);
    
    if (convertedCount > 0) {
      console.log('\n📋 Updated database records:');
      const updatedFiles = await db.select().from(galleryFiles).where(eq(galleryFiles.contentType, 'image/jpeg'));
      for (const file of updatedFiles) {
        if (file.filename.includes('.jpg')) {
          console.log(`  - ${file.filename} (${file.fileSize} bytes)`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Conversion failed:', error);
    process.exit(1);
  }
}

convertHeicImages();