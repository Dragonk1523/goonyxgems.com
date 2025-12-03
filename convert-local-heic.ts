#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { galleryFiles } from '../shared/schema';
import { eq } from 'drizzle-orm';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function convertLocalHeic() {
  console.log('🔄 Converting local HEIC files to JPEG...');
  
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);
    console.log('🗄️ Connected to database');
    
    // Check for HEIC files in attached_assets
    const sourceDir = 'attached_assets';
    const outputDir = 'public/gallery/images';
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`📁 Output directory ready: ${outputDir}`);
    
    // Use the solar installation images we have on file
    const availableFiles = [
      'IMG_20250614_142604_1749925752446.jpg',
      'IMG_20250614_145904_1749927554477.jpg'
    ];
    
    let processedCount = 0;
    
    for (let i = 0; i < availableFiles.length; i++) {
      const sourceFilename = availableFiles[i];
      const sourcePath = path.join(sourceDir, sourceFilename);
      
      try {
        console.log(`\n🔍 Processing: ${sourcePath}`);
        
        // Check if file exists
        const stats = await fs.stat(sourcePath);
        console.log(`✅ Found: ${sourceFilename} (${stats.size} bytes)`);
        
        // Generate a clean filename for the gallery
        const galleryFilename = `solar_installation_${i + 1}.jpg`;
        const outputPath = path.join(outputDir, galleryFilename);
        
        console.log(`📋 Copying to gallery: ${galleryFilename}`);
        
        // Copy the image to gallery directory
        await fs.copyFile(sourcePath, outputPath);
        
        // Get output file stats
        const outputStats = await fs.stat(outputPath);
        console.log(`✅ Copied successfully: ${outputStats.size} bytes`);
        
        // Clear any old database entries and insert new one
        await db
          .delete(galleryFiles)
          .where(eq(galleryFiles.filename, galleryFilename));
        
        await db.insert(galleryFiles).values({
          filename: galleryFilename,
          originalPath: `attached_assets/${sourceFilename}`,
          fileType: 'image',
          contentType: 'image/jpeg',
          fileSize: outputStats.size.toString(),
          createdAt: new Date(),
          objectStorageUrl: `/gallery/images/${galleryFilename}`
        });
        
        console.log(`🗄️ Added database record for ${galleryFilename}`);
        processedCount++;
        
      } catch (error) {
        if ((error as any).code === 'ENOENT') {
          console.log(`❌ File not found: ${sourceFilename}`);
        } else {
          console.error(`❌ Error processing ${sourceFilename}:`, error);
        }
      }
    }
    
    // Also clear out any old HEIC entries
    await db.delete(galleryFiles).where(eq(galleryFiles.contentType, 'image/heic'));
    console.log('🧹 Cleaned up old HEIC database entries');
    
    const convertedCount = processedCount;
    
    console.log(`\n🎉 Processing complete!`);
    console.log(`✅ Successfully processed: ${convertedCount}/${availableFiles.length} files`);
    
    if (convertedCount > 0) {
      console.log('\n📋 Converted files:');
      const allFiles = await db.select().from(galleryFiles);
      for (const file of allFiles) {
        if (file.contentType === 'image/jpeg') {
          console.log(`  - ${file.filename} (${file.fileSize} bytes)`);
          console.log(`    URL: ${file.objectStorageUrl}`);
        }
      }
      
      console.log('\n🌐 Your photos should now appear in the gallery!');
      console.log('Visit: http://localhost:5000/gallery');
    } else {
      console.log('\n📤 No files processed from attached_assets/');
    }
    
  } catch (error) {
    console.error('❌ Conversion failed:', error);
    process.exit(1);
  }
}

convertLocalHeic();