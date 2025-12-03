#!/usr/bin/env node
// Sync object storage files to database

import { Client } from '@replit/object-storage';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { galleryFiles } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

async function syncObjectStorageToDatabase() {
  console.log('🔄 Starting object storage to database sync...');
  
  try {
    // Initialize database
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);
    
    // Initialize object storage client
    const client = new Client();
    console.log('📦 Connected to object storage and database');
    
    // List all objects in bucket
    const { ok, value: objects, error } = await client.list();
    if (!ok) {
      console.error('❌ Failed to list objects:', error);
      return;
    }
    
    console.log(`📋 Found ${objects.length} objects in bucket`);
    
    let synced = 0;
    let skipped = 0;
    
    for (const obj of objects) {
      // Skip folders
      if (obj.name.endsWith('/')) {
        continue;
      }
      
      console.log(`\n📥 Processing: ${obj.name}`);
      
      // Check if already in database
      const existing = await db.select().from(galleryFiles)
        .where(eq(galleryFiles.originalPath, obj.name))
        .limit(1);
      
      if (existing.length > 0) {
        console.log(`⏭️ Already in database, skipping`);
        skipped++;
        continue;
      }
      
      // Determine file type
      const filename = obj.name.split('/').pop() || obj.name;
      const ext = filename.toLowerCase().split('.').pop();
      
      let fileType = 'unknown';
      let contentType = 'application/octet-stream';
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg', 'heic', 'heif'].includes(ext)) {
        fileType = 'image';
        contentType = getContentType(filename);
      } else if (['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) {
        fileType = 'video';
        contentType = getContentType(filename);
      }
      
      if (fileType === 'unknown') {
        console.log(`⏭️ Unknown file type, skipping`);
        continue;
      }
      
      // Insert into database
      try {
        await db.insert(galleryFiles).values({
          filename: filename,
          originalPath: obj.name,
          contentType: contentType,
          fileSize: (obj.size || 0).toString(),
          fileType: fileType,
          isConverted: (ext === 'heic' || ext === 'heif') ? 'false' : 'true',
          objectStorageUrl: `/api/objects/${encodeURIComponent(obj.name)}`,
        });
        
        console.log(`✅ Added to database: ${filename}`);
        synced++;
      } catch (dbError) {
        console.error(`❌ Database insert failed:`, dbError.message);
      }
    }
    
    console.log(`\n🎉 Sync complete!`);
    console.log(`📁 Files synced: ${synced}`);
    console.log(`⏭️ Files skipped: ${skipped}`);
    
    // Display current database contents
    const allFiles = await db.select().from(galleryFiles);
    console.log(`\n📊 Total files in database: ${allFiles.length}`);
    
    for (const file of allFiles) {
      console.log(`  - ${file.filename} (${file.fileType}, ${file.contentType})`);
    }
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

function getContentType(filename) {
  const ext = filename.toLowerCase().split('.').pop();
  
  const mimeTypes = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    'heic': 'image/heic',
    'heif': 'image/heif',
    
    // Videos
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'avi': 'video/avi',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'mkv': 'video/x-matroska',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncObjectStorageToDatabase();
}

export { syncObjectStorageToDatabase };