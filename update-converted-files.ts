#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { galleryFiles } from '../shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

async function updateConvertedFiles() {
  console.log('🔄 Updating database records for converted files...');
  
  try {
    // Initialize database
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);
    console.log('🗄️ Connected to database');
    
    // Get all HEIC files from database
    const heicFiles = await db.select().from(galleryFiles).where(eq(galleryFiles.contentType, 'image/heic'));
    console.log(`📋 Found ${heicFiles.length} HEIC files to update`);
    
    for (const heicFile of heicFiles) {
      try {
        console.log(`\n🔄 Processing: ${heicFile.filename}`);
        
        // Generate converted filename
        const jpegFilename = heicFile.filename.replace(/\.heic$/i, '.jpg');
        const localPath = path.join('public/gallery/images', jpegFilename);
        
        // Check if converted file exists
        try {
          const stats = await fs.stat(localPath);
          console.log(`✅ Found converted file: ${jpegFilename} (${stats.size} bytes)`);
          
          // Update database record
          await db
            .update(galleryFiles)
            .set({
              objectStorageUrl: `/gallery/images/${jpegFilename}`,
              contentType: 'image/jpeg',
              fileSize: stats.size.toString(),
              filename: jpegFilename
            })
            .where(eq(galleryFiles.id, heicFile.id));
          
          console.log(`🗄️ Updated database record for ${jpegFilename}`);
          
        } catch (error) {
          console.error(`❌ Converted file not found: ${jpegFilename}`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${heicFile.filename}:`, error);
      }
    }
    
    console.log('\n🎉 Database update complete!');
    
    // Show updated records
    const updatedFiles = await db.select().from(galleryFiles);
    console.log('\n📋 All gallery files:');
    for (const file of updatedFiles) {
      console.log(`  - ${file.filename} (${file.contentType}, ${file.fileSize} bytes)`);
    }
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

updateConvertedFiles();