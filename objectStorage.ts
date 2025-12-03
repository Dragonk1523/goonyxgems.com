import { Client } from '@replit/object-storage';

interface GalleryItem {
  name: string;
  size: number;
  contentType: string;
  timeCreated: string;
  url: string;
  displayUrl?: string;
}

interface GalleryData {
  images: GalleryItem[];
  videos: GalleryItem[];
}

export class ObjectStorageService {
  private static sharedClient: any = null;
  private client: any;
  
  constructor() {
    // Use a shared client instance to avoid initialization issues
    if (!ObjectStorageService.sharedClient) {
      console.log('Creating new object storage client...');
      ObjectStorageService.sharedClient = new Client();
    }
    this.client = ObjectStorageService.sharedClient;
  }

  async listGalleryItems(): Promise<GalleryData> {
    const images: GalleryItem[] = [];
    const videos: GalleryItem[] = [];
    
    try {
      console.log('Reading gallery from database...');
      
      // Import database dependencies
      const { drizzle } = await import('drizzle-orm/neon-http');
      const { neon } = await import('@neondatabase/serverless');
      const { galleryFiles } = await import('@shared/schema');
      
      // Initialize database
      const sql = neon(process.env.DATABASE_URL!);
      const db = drizzle(sql);
      
      // Get all gallery files from database
      const dbFiles = await db.select().from(galleryFiles);
      console.log(`Found ${dbFiles.length} files in database`);
      
      // Process database records
      for (const dbFile of dbFiles) {
        const item: GalleryItem = {
          name: dbFile.filename,
          size: parseInt(dbFile.fileSize || '0') || 0,
          contentType: dbFile.contentType,
          timeCreated: dbFile.createdAt.toISOString(),
          url: dbFile.objectStorageUrl || `/api/objects/${encodeURIComponent(dbFile.originalPath)}`
        };
        
        // For HEIC files, provide conversion endpoint
        if (dbFile.contentType === 'image/heic' || dbFile.contentType === 'image/heif') {
          item.displayUrl = `/api/objects/web/${encodeURIComponent(dbFile.originalPath)}`;
          console.log(`HEIC file from DB: ${dbFile.filename}, displayUrl: ${item.displayUrl}`);
        }
        
        // Add to appropriate array
        if (dbFile.fileType === 'image') {
          images.push(item);
          console.log(`Added image from DB: ${dbFile.filename}, Type: ${item.contentType}, Size: ${item.size}`);
        } else if (dbFile.fileType === 'video') {
          videos.push(item);
          console.log(`Added video from DB: ${dbFile.filename}, Type: ${item.contentType}, Size: ${item.size}`);
        }
      }
      
      // No longer include placeholder local files - only database records
      
      console.log(`Database gallery summary: ${images.length} images, ${videos.length} videos`);
    } catch (error) {
      console.error('Error reading gallery from database:', error);
    }
    
    return { images, videos };
  }

  async downloadObject(objectKey: string): Promise<{ ok: boolean; data?: Buffer; error?: string }> {
    try {
      console.log(`Downloading object: ${objectKey}`);
      const contentType = this.getContentType(objectKey);
      console.log(`Content type detected: ${contentType}`);
      
      // Try multiple download methods for better reliability
      let data: Buffer | undefined;
      let downloadOk = false;
      
      // Method 1: downloadAsBytes
      try {
        const result1 = await this.client.downloadAsBytes(objectKey);
        if (result1.ok && result1.value && result1.value.length > 100) {
          data = result1.value;
          downloadOk = true;
          console.log(`✅ Method 1 success: ${data!.length} bytes`);
        } else {
          console.log(`❌ Method 1 failed: ${result1.value?.length || 0} bytes`);
          
          // Method 2: downloadAsStream for larger files
          const result2 = await this.client.downloadAsStream(objectKey);
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
        console.error(`❌ Download error:`, error);
      }
      
      if (!downloadOk || !data || data.length < 100) {
        console.error(`❌ All download methods failed for ${objectKey}`);
        return { ok: false, error: 'File too small or corrupted' };
      }
      
      console.log(`Successfully downloaded ${objectKey}: ${data.length} bytes`);
      return { ok: true, data, error: undefined };
      
    } catch (error) {
      console.error(`Download failed for ${objectKey}:`, error);
      return { ok: false, error: String(error) };
    }
  }

  // Generate key for converted image cache
  getConvertedKey(originalKey: string, quality = 85): string {
    const baseName = originalKey.split('/').pop()?.split('.')[0] || 'image';
    const dir = originalKey.substring(0, originalKey.lastIndexOf('/'));
    return `${dir}/converted/${baseName}_q${quality}.jpg`;
  }

  // Check if object exists in storage
  async objectExists(key: string): Promise<boolean> {
    try {
      const { ok } = await this.client.downloadAsBytes(key);
      return ok;
    } catch {
      return false;
    }
  }

  // Upload converted image to storage
  async uploadConvertedImage(key: string, buffer: Buffer): Promise<boolean> {
    try {
      const { ok } = await this.client.uploadFromBytes(key, buffer);
      return ok;
    } catch (error) {
      console.error('Failed to upload converted image:', error);
      return false;
    }
  }

  // Convert HEIC to JPEG using Sharp
  async convertHeicToJpeg(heicBuffer: Buffer, quality = 85): Promise<Buffer | null> {
    try {
      console.log('Starting HEIC to JPEG conversion with Sharp...');
      console.log(`Input buffer size: ${heicBuffer.length} bytes`);
      
      // Validate input buffer exists
      if (!heicBuffer) {
        console.error('No buffer provided for HEIC conversion');
        return null;
      }
      
      // Check if buffer is actually empty (not just metadata showing 0)
      if (heicBuffer.length === 0) {
        console.error('Empty buffer provided for HEIC conversion');
        return null;
      }
      
      // Check buffer starts with HEIC signature (ftyp)
      const signature = heicBuffer.slice(4, 8).toString();
      if (!signature.includes('hei') && !signature.includes('mif1')) {
        console.warn(`Buffer may not be a valid HEIC file (signature: ${signature}), but attempting conversion anyway`);
      }
      
      // Use Sharp for reliable HEIC conversion
      const sharp = (await import('sharp')).default;
      
      // Convert HEIC to JPEG using Sharp
      const jpegBuffer = await sharp(heicBuffer)
        .jpeg({ quality })
        .toBuffer();

      console.log(`HEIC conversion successful with Sharp, output size: ${jpegBuffer.length} bytes`);
      return jpegBuffer;
    } catch (error) {
      console.error('HEIC conversion failed with Sharp:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      
      // Try to provide more specific error info
      if (error instanceof Error && error.message.includes('Input file contains unsupported image format')) {
        console.error('This may not be a valid HEIC file or Sharp may not support this variant');
      }
      
      return null;
    }
  }

  getContentType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    
    const mimeTypes: { [key: string]: string } = {
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
      
      // Default
      'default': 'application/octet-stream'
    };
    
    return mimeTypes[ext || ''] || mimeTypes.default;
  }

  // Sync all object storage files to database
  async syncAllFilesToDatabase(): Promise<{ synced: number; errors: string[] }> {
    try {
      const { drizzle } = await import('drizzle-orm/neon-http');
      const { neon } = await import('@neondatabase/serverless');
      const { galleryFiles } = await import('@shared/schema');
      
      const sql = neon(process.env.DATABASE_URL!);
      const db = drizzle(sql);
      
      console.log('🔄 Listing all objects in storage...');
      const { ok, value: objects } = await this.client.list();
      
      if (!ok || !objects) {
        return { synced: 0, errors: ['Failed to list objects from storage'] };
      }
      
      let synced = 0;
      const errors: string[] = [];
      
      for (const obj of objects) {
        try {
          const filename = obj.name.split('/').pop() || obj.name;
          const ext = filename.toLowerCase().split('.').pop() || '';
          
          let fileType = 'unknown';
          if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp', 'tiff', 'svg'].includes(ext)) {
            fileType = 'image';
          } else if (['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) {
            fileType = 'video';
          }
          
          if (fileType === 'unknown') {
            console.log(`⏭️ Skipping unknown file type: ${filename}`);
            continue;
          }
          
          // Check if already exists in database
          const existing = await db.select().from(galleryFiles).where(
            (await import('drizzle-orm')).eq(galleryFiles.originalPath, obj.name)
          );
          
          if (existing.length > 0) {
            console.log(`✅ Already in database: ${filename}`);
            continue;
          }
          
          await db.insert(galleryFiles).values({
            filename: filename,
            originalPath: obj.name,
            contentType: this.getContentType(filename),
            fileSize: (obj.size || 0).toString(),
            fileType: fileType,
            isConverted: (ext === 'heic' || ext === 'heif') ? 'false' : 'true',
            objectStorageUrl: `/api/objects/${encodeURIComponent(obj.name)}`,
          });
          
          console.log(`✅ Added to database: ${filename}`);
          synced++;
          
        } catch (error) {
          const errorMsg = `Failed to sync ${obj.name}: ${error}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
        }
      }
      
      return { synced, errors };
      
    } catch (error) {
      console.error('❌ Sync failed:', error);
      return { synced: 0, errors: [String(error)] };
    }
  }

  // Update database record after successful conversion
  async updateConvertedFile(originalId: number, jpegFilename: string, jpegPath: string, fileSize: number): Promise<boolean> {
    try {
      const { drizzle } = await import('drizzle-orm/neon-http');
      const { neon } = await import('@neondatabase/serverless');
      const { galleryFiles } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const sql = neon(process.env.DATABASE_URL!);
      const db = drizzle(sql);
      
      await db
        .update(galleryFiles)
        .set({
          objectStorageUrl: `/gallery/images/${jpegFilename}`,
          contentType: 'image/jpeg',
          fileSize: fileSize.toString(),
          filename: jpegFilename,
          isConverted: 'true',
          localPath: jpegPath
        })
        .where(eq(galleryFiles.id, originalId));
      
      return true;
    } catch (error) {
      console.error('Failed to update database after conversion:', error);
      return false;
    }
  }
}

// Export an instance for use in other modules
export const codexStorage = new ObjectStorageService();