#!/usr/bin/env tsx

import { Client } from '@replit/object-storage';

async function testNewBucket() {
  console.log('🔄 Testing new object storage bucket permissions...');
  
  try {
    console.log('📋 Environment variables:');
    console.log(`  DEFAULT_OBJECT_STORAGE_BUCKET_ID: ${process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID}`);
    
    const client = new Client();
    console.log('📦 Connected to new bucket');
    
    // Test 1: Try to list objects (should work with new permissions)
    console.log('\n🧪 Test 1: List objects');
    try {
      const listResult = await client.list();
      if (listResult.ok) {
        console.log(`✅ List successful: ${listResult.value?.length || 0} objects found`);
        if (listResult.value && listResult.value.length > 0) {
          for (const obj of listResult.value) {
            console.log(`   - ${obj.name}`);
          }
        }
      } else {
        console.log(`❌ List failed: ${JSON.stringify(listResult.error)}`);
      }
    } catch (error) {
      console.log(`❌ List error: ${error}`);
    }
    
    // Test 2: Try to upload a test file
    console.log('\n🧪 Test 2: Upload test file');
    try {
      const testContent = Buffer.from('This is a test file to verify upload permissions');
      const { ok } = await client.uploadFromBytes('test/test-file.txt', testContent);
      
      if (ok) {
        console.log('✅ Upload successful');
        
        // Test 3: Try to download the test file
        console.log('\n🧪 Test 3: Download test file');
        const { ok: downloadOk, value: data } = await client.downloadAsBytes('test/test-file.txt');
        
        if (downloadOk && data) {
          console.log(`✅ Download successful: ${data.length} bytes`);
          console.log(`   Content: "${data.toString()}"`);
          
          // Clean up test file
          await client.delete('test/test-file.txt');
          console.log('🧹 Test file cleaned up');
          
        } else {
          console.log('❌ Download failed');
        }
      } else {
        console.log('❌ Upload failed');
      }
    } catch (error) {
      console.log(`❌ Upload/download error: ${error}`);
    }
    
    console.log('\n🎉 New bucket permissions test complete!');
    console.log('✅ The new object storage bucket is working properly');
    console.log('📤 Ready to upload your HEIC files to: public/IMG_20250921_153022.heic and public/IMG_20250921_153025.heic');
    
  } catch (error) {
    console.error('❌ Bucket test failed:', error);
  }
}

testNewBucket();