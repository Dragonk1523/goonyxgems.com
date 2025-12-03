#!/usr/bin/env tsx

import { Client } from '@replit/object-storage';

async function checkObjectSizes() {
  console.log('🔍 Checking object sizes in bucket...');
  
  try {
    const client = new Client();
    console.log('📦 Connected to object storage');
    
    // List all objects to see their actual sizes
    const listResult = await client.list();
    console.log(`📋 List result:`, listResult);
    
    if (!listResult || !listResult.ok || !Array.isArray(listResult.value)) {
      console.log('❌ List returned unexpected result');
      return;
    }
    
    const objects = listResult.value;
    console.log(`📋 Found ${objects.length} objects in bucket`);
    
    // Check specific HEIC files by trying to download them to check actual size
    const heicFiles = objects.filter(obj => obj.name.includes('.heic'));
    console.log(`🖼️ HEIC files found: ${heicFiles.length}`);
    
    for (const heicFile of heicFiles) {
      console.log(`\n📄 Object: ${heicFile.name}`);
      
      // Try to download to check actual size
      try {
        const { ok, value: data, error } = await client.downloadAsBytes(heicFile.name);
        if (ok && data) {
          console.log(`   Actual downloaded size: ${data.length} bytes`);
          if (data.length <= 1) {
            console.log(`❌ PROBLEM: ${heicFile.name} downloads as only ${data.length} bytes (should be ~5MB)`);
            console.log(`   This confirms the object is corrupted/incomplete in storage`);
          } else {
            console.log(`✅ OK: ${heicFile.name} downloads as ${data.length} bytes`);
          }
        } else {
          console.log(`❌ Download failed: ${error}`);
        }
      } catch (error) {
        console.log(`❌ Download error: ${error}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking object sizes:', error);
  }
}

checkObjectSizes();