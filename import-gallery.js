#!/usr/bin/env node
// Import all gallery files from object storage and convert HEIC to JPEG

import { Client } from '@replit/object-storage';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function importGallery() {
  console.log('🚀 Starting gallery import from object storage...');
  
  try {
    // Create directories
    const galleryDir = 'public/gallery';
    const imagesDir = path.join(galleryDir, 'images');
    const videosDir = path.join(galleryDir, 'videos');
    
    await fs.mkdir(galleryDir, { recursive: true });
    await fs.mkdir(imagesDir, { recursive: true });
    await fs.mkdir(videosDir, { recursive: true });
    
    // Initialize object storage client
    const client = new Client();
    console.log('📦 Connected to object storage');
    
    // List all objects
    const { ok, value: objects, error } = await client.list();
    if (!ok) {
      console.error('❌ Failed to list objects:', error);
      return;
    }
    
    console.log(`📋 Found ${objects.length} objects in bucket`);
    
    let imported = 0;
    let converted = 0;
    
    for (const obj of objects) {
      // Skip folders
      if (obj.name.endsWith('/')) {
        continue;
      }
      
      console.log(`\n📥 Processing: ${obj.name}`);
      
      // Download the file - Try multiple approaches to work around 1-byte issue
      console.log(`Attempting download...`);
      
      // Try method 1: Standard download
      let data = null;
      let downloadOk = false;
      
      try {
        const result1 = await client.downloadAsBytes(obj.name);
        if (result1.ok && result1.value && result1.value.length > 100) {
          data = result1.value;
          downloadOk = true;
          console.log(`✅ Method 1 success: ${data.length} bytes`);
        } else {
          console.log(`❌ Method 1 failed: ${result1.value?.length || 0} bytes`);
          
          // Try method 2: Stream download
          const result2 = await client.downloadAsStream(obj.name);
          if (result2.ok && result2.value) {
            const chunks = [];
            for await (const chunk of result2.value) {
              chunks.push(chunk);
            }
            data = Buffer.concat(chunks);
            if (data.length > 100) {
              downloadOk = true;
              console.log(`✅ Method 2 success: ${data.length} bytes`);
            } else {
              console.log(`❌ Method 2 failed: ${data.length} bytes`);
            }
          }
        }
      } catch (error) {
        console.error(`❌ Download error:`, error.message);
      }
      
      if (!downloadOk || !data || data.length < 100) {
        console.error(`❌ All download methods failed for ${obj.name}`);
        continue;
      }
      
      console.log(`✅ Downloaded ${data.length} bytes`);
      
      // Determine file type and destination
      const filename = path.basename(obj.name);
      const ext = path.extname(filename).toLowerCase();
      
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'].includes(ext)) {
        // Handle images
        let finalData = data;
        let finalFilename = filename;
        
        if (ext === '.heic' || ext === '.heif') {
          // Convert HEIC to JPEG
          console.log('🔄 Converting HEIC to JPEG...');
          try {
            finalData = await sharp(data).jpeg({ quality: 85 }).toBuffer();
            finalFilename = filename.replace(/\.(heic|heif)$/i, '.jpg');
            console.log(`✅ Converted to JPEG: ${finalData.length} bytes`);
            converted++;
          } catch (convError) {
            console.error(`❌ HEIC conversion failed:`, convError.message);
            continue;
          }
        }
        
        // Save image
        const imagePath = path.join(imagesDir, finalFilename);
        await fs.writeFile(imagePath, finalData);
        console.log(`💾 Saved image: ${imagePath}`);
        imported++;
        
      } else if (['.mp4', '.webm', '.ogg', '.avi', '.mov'].includes(ext)) {
        // Handle videos
        const videoPath = path.join(videosDir, filename);
        await fs.writeFile(videoPath, data);
        console.log(`💾 Saved video: ${videoPath}`);
        imported++;
      } else {
        console.log(`⏭️  Skipping unknown file type: ${filename}`);
      }
    }
    
    console.log(`\n🎉 Import complete!`);
    console.log(`📁 Files imported: ${imported}`);
    console.log(`🔄 HEIC files converted: ${converted}`);
    console.log(`📂 Files saved to: ${galleryDir}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importGallery();
}

export { importGallery };