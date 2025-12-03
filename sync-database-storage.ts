
#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { galleryFiles } from '../shared/schema';
import { ObjectStorageService } from '../server/objectStorage';

async function syncDatabaseStorage() {
  console.log('🔄 Starting database-storage sync...');
  
  try {
    const objectStorageService = new ObjectStorageService();
    
    // Step 1: Sync all storage files to database
    console.log('\n📥 Syncing storage files to database...');
    const syncResult = await objectStorageService.syncAllFilesToDatabase();
    console.log(`✅ Synced ${syncResult.synced} files to database`);
    
    if (syncResult.errors.length > 0) {
      console.log('❌ Sync errors:');
      syncResult.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Step 2: Check database integrity
    console.log('\n🔍 Checking database integrity...');
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);
    
    const allFiles = await db.select().from(galleryFiles);
    console.log(`📊 Total files in database: ${allFiles.length}`);
    
    const heicFiles = allFiles.filter(f => f.contentType === 'image/heic' && f.isConverted === 'false');
    const convertedFiles = allFiles.filter(f => f.isConverted === 'true');
    
    console.log(`🔄 HEIC files needing conversion: ${heicFiles.length}`);
    console.log(`✅ Already converted files: ${convertedFiles.length}`);
    
    // Step 3: Validate file accessibility
    console.log('\n🔍 Validating file accessibility...');
    let accessibleCount = 0;
    let inaccessibleCount = 0;
    
    for (const file of allFiles) {
      try {
        if (file.objectStorageUrl?.startsWith('/gallery/')) {
          // Local file
          const fs = await import('fs/promises');
          const path = await import('path');
          const localPath = path.join('public', file.objectStorageUrl);
          await fs.access(localPath);
          accessibleCount++;
        } else {
          // Object storage file
          const result = await objectStorageService.downloadObject(file.originalPath);
          if (result.ok && result.data && result.data.length > 100) {
            accessibleCount++;
          } else {
            console.log(`❌ Inaccessible: ${file.filename} (${result.error || 'small/empty file'})`);
            inaccessibleCount++;
          }
        }
      } catch (error) {
        console.log(`❌ Inaccessible: ${file.filename} (${error})`);
        inaccessibleCount++;
      }
    }
    
    console.log(`\n📊 File accessibility summary:`);
    console.log(`✅ Accessible files: ${accessibleCount}`);
    console.log(`❌ Inaccessible files: ${inaccessibleCount}`);
    
    if (heicFiles.length > 0) {
      console.log('\n💡 Next steps:');
      console.log('1. Run the "Convert HEIC Files" workflow to convert remaining HEIC files');
      console.log('2. Check that HEIC files in object storage are not corrupted');
    }
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

syncDatabaseStorage();
