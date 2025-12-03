#!/usr/bin/env tsx

import { Client } from '@replit/object-storage';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { galleryFiles } from '../shared/schema';
import { eq } from 'drizzle-orm';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function fixHeicConversion() {
  console.log('🔄 Fixing HEIC conversion with direct approach...');
  
  try {
    // Log current environment variables
    console.log('📋 Environment check:');
    console.log(`  DEFAULT_OBJECT_STORAGE_BUCKET_ID: ${process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID}`);
    console.log(`  PRIVATE_OBJECT_DIR: ${process.env.PRIVATE_OBJECT_DIR}`);
    console.log(`  PUBLIC_OBJECT_SEARCH_PATHS: ${process.env.PUBLIC_OBJECT_SEARCH_PATHS}`);
    
    const client = new Client();
    console.log('📦 Client created');
    
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);
    
    // Updated HEIC file paths for new bucket
    const heicPaths = [
      'public/IMG_20250921_153022.heic',
      'public/IMG_20250921_153025.heic'
    ];
    
    // Ensure output directory exists
    const outputDir = 'public/gallery/images';
    await fs.mkdir(outputDir, { recursive: true });
    
    for (const heicPath of heicPaths) {
      console.log(`\n🔄 Processing: ${heicPath}`);
      
      try {
        // Try different download approaches
        console.log('📥 Attempting downloadAsBytes...');
        const { ok, value: data, error } = await client.downloadAsBytes(heicPath);
        
        if (ok && data && data.length > 100) {
          console.log(`✅ Downloaded ${data.length} bytes`);
          
          const filename = path.basename(heicPath);
          const jpegFilename = filename.replace(/\.heic$/i, '.jpg');
          const outputPath = path.join(outputDir, jpegFilename);
          
          console.log(`🖼️ Converting to JPEG: ${jpegFilename}`);
          
          // Convert HEIC to JPEG
          await sharp(data)
            .jpeg({ quality: 85 })
            .toFile(outputPath);
          
          const stats = await fs.stat(outputPath);
          console.log(`✅ Converted successfully: ${stats.size} bytes`);
          
          // Update database record
          await db
            .update(galleryFiles)
            .set({
              objectStorageUrl: `/gallery/images/${jpegFilename}`,
              contentType: 'image/jpeg',
              fileSize: stats.size.toString(),
              filename: jpegFilename
            })
            .where(eq(galleryFiles.originalPath, heicPath));
          
          console.log(`🗄️ Updated database record`);
          
        } else {
          console.log(`❌ Download failed: ${JSON.stringify(error)} (size: ${data?.length || 0})`);
          console.log(`Full result:`, { ok, value: data?.length, error });
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${heicPath}:`, error);
      }
    }
    
    console.log('\n🎉 Conversion attempt complete!');
    
    // Check final database state
    const allFiles = await db.select().from(galleryFiles);
    console.log('\n📋 Final database state:');
    for (const file of allFiles) {
      console.log(`  - ${file.filename} (${file.contentType})`);
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

fixHeicConversion();