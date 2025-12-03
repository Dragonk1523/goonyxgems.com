import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService } from "./objectStorage";
import { insertContactInquirySchema } from "@shared/schema";
import { sendEmail, generateContactEmailHtml, generateContactEmailText } from "./email";
import { sendSMS, generateQuoteReminderSMS, generateFollowUpSMS } from "./sms";
import { hashPassword, verifyPassword, generateToken, requireAuth, requireRole, type AuthRequest } from "./auth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact inquiry routes
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactInquirySchema.parse(req.body);
      const inquiry = await storage.createContactInquiry(validatedData);
      
      // Send email notification
      try {
        const emailSent = await sendEmail({
          to: "info@goonyxgems.com", // Company email
          from: "noreply@onyxenersol.com", // From address
          subject: `New Solar Quote Request from ${inquiry.firstName} ${inquiry.lastName}`,
          text: generateContactEmailText(inquiry),
          html: generateContactEmailHtml(inquiry)
        });
        
        console.log(`Email notification ${emailSent ? 'sent' : 'failed'} for inquiry ${inquiry.id}`);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the request if email fails
      }
      
      res.json(inquiry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid form data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to submit inquiry" });
      }
    }
  });

  app.get("/api/contact", async (req, res) => {
    try {
      const inquiries = await storage.getContactInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });

  app.get("/api/contact/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inquiry = await storage.getContactInquiry(id);
      if (!inquiry) {
        res.status(404).json({ error: "Inquiry not found" });
        return;
      }
      res.json(inquiry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inquiry" });
    }
  });

  // AI Roof Detection endpoint
  app.post("/api/detect-roof", async (req, res) => {
    try {
      const { imageData, bounds } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ error: "Image data required" });
      }

      const openaiApiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
      const openaiBaseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

      if (!openaiApiKey) {
        return res.status(500).json({ error: "AI service not configured" });
      }

      // Call OpenAI Vision API
      const response = await fetch(`${openaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this satellite/aerial image and identify the main building roof. Return ONLY a JSON object with the roof's bounding box coordinates as percentages of the image dimensions (0-100%). Format: {"minX": number, "minY": number, "maxX": number, "maxY": number, "confidence": number}. The roof should be the largest rectangular structure visible.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
          max_tokens: 300
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('OpenAI API error:', result);
        return res.status(500).json({ error: 'AI analysis failed' });
      }

      const content = result.choices[0]?.message?.content;
      const roofData = JSON.parse(content);
      
      res.json(roofData);
    } catch (error) {
      console.error('Roof detection error:', error);
      res.status(500).json({ error: "Failed to detect roof" });
    }
  });

  // Mapbox API key endpoint
  app.get("/api/mapbox-key", async (req, res) => {
    try {
      const apiKey = process.env.MAPBOX_PUBLIC_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Mapbox API key not configured" });
      }
      res.json({ apiKey });
    } catch (error) {
      console.error('Error fetching Mapbox key:', error);
      res.status(500).json({ error: "Failed to fetch API key" });
    }
  });

  // Gallery routes
  app.get("/api/gallery", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const galleryItems = await objectStorageService.listGalleryItems();
      res.json(galleryItems);
    } catch (error) {
      console.error('Gallery error:', error);
      res.status(500).json({ error: "Failed to fetch gallery items" });
    }
  });


  // Web-optimized object serving (converts HEIC to JPEG)
  app.get("/api/objects/web/:objectKey(*)", async (req, res) => {
    const objectKey = decodeURIComponent(req.params.objectKey);
    const objectStorageService = new ObjectStorageService();
    
    try {
      const contentType = objectStorageService.getContentType(objectKey);
      
      // If it's HEIC/HEIF, convert to JPEG
      if (contentType === 'image/heic' || contentType === 'image/heif') {
        const convertedKey = objectStorageService.getConvertedKey(objectKey);
        
        // Check if converted version already exists
        const convertedExists = await objectStorageService.objectExists(convertedKey);
        
        if (convertedExists) {
          // Serve cached converted version
          const result = await objectStorageService.downloadObject(convertedKey);
          if (result.ok && result.data) {
            res.set({
              'Content-Type': 'image/jpeg',
              'Content-Length': result.data.length.toString(),
              'Cache-Control': 'public, max-age=31536000, immutable'
            });
            return res.send(result.data);
          }
        }
        
        // Convert and cache
        console.log(`Converting HEIC image: ${objectKey}`);
        const heicResult = await objectStorageService.downloadObject(objectKey);
        
        if (!heicResult.ok || !heicResult.data) {
          console.error(`Failed to download HEIC file: ${objectKey}, error: ${heicResult.error}`);
          return res.status(404).json({ error: "Original image not found" });
        }
        
        console.log(`Downloaded HEIC file successfully: ${heicResult.data.length} bytes`);
        
        const jpegBuffer = await objectStorageService.convertHeicToJpeg(heicResult.data);
        
        if (!jpegBuffer) {
          console.error(`HEIC conversion failed for: ${objectKey}`);
          return res.status(500).json({ error: "Image conversion failed" });
        }
        
        // Cache the converted image
        await objectStorageService.uploadConvertedImage(convertedKey, jpegBuffer);
        
        res.set({
          'Content-Type': 'image/jpeg',
          'Content-Length': jpegBuffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable'
        });
        
        return res.send(jpegBuffer);
      }
      
      // For non-HEIC images, serve directly
      const result = await objectStorageService.downloadObject(objectKey);
      
      if (!result.ok || !result.data) {
        return res.status(404).json({ error: "Object not found" });
      }
      
      res.set({
        'Content-Type': contentType,
        'Content-Length': result.data.length.toString(),
        'Cache-Control': 'public, max-age=3600'
      });
      
      res.send(result.data);
    } catch (error) {
      console.error('Error serving web object:', error);
      res.status(500).json({ error: "Failed to serve object" });
    }
  });

  // Object serving for gallery items
  app.get("/api/objects/:objectKey(*)", async (req, res) => {
    const objectKey = decodeURIComponent(req.params.objectKey);
    const objectStorageService = new ObjectStorageService();
    try {
      const result = await objectStorageService.downloadObject(objectKey);
      if (!result.ok || !result.data) {
        return res.status(404).json({ error: "Object not found" });
      }
      
      // Set appropriate headers
      const contentType = objectStorageService.getContentType(objectKey);
      res.set({
        'Content-Type': contentType,
        'Content-Length': result.data.length.toString(),
        'Cache-Control': 'public, max-age=3600'
      });
      
      res.send(result.data);
    } catch (error) {
      console.error("Error serving object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Gallery file serving - serve from local files
  app.get("/gallery/:type/:filename", async (req, res) => {
    try {
      const { type, filename } = req.params;
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Validate type
      if (!['images', 'videos'].includes(type)) {
        return res.status(404).json({ error: "Invalid gallery type" });
      }
      
      const filePath = path.join('public/gallery', type, filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ error: "File not found" });
      }
      
      // Get file stats
      const stats = await fs.stat(filePath);
      const objectStorageService = new ObjectStorageService();
      const contentType = objectStorageService.getContentType(filename);
      
      // Set headers
      res.set({
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=86400' // 24 hours
      });
      
      // Stream the file
      const readStream = (await import('fs')).createReadStream(filePath);
      readStream.pipe(res);
      
    } catch (error) {
      console.error('Error serving gallery file:', error);
      res.status(500).json({ error: "Failed to serve file" });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || !(await verifyPassword(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken({ 
        id: user.id, 
        username: user.username, 
        role: user.role || 'customer' 
      });
      
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/register", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const { username, password, email, role = 'rep' } = req.body;
      const hashedPassword = await hashPassword(password);
      
      const user = await storage.createUser({
        username,
        password: hashedPassword
      });
      
      res.json({ user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Communication routes
  app.post("/api/communications/email/:inquiryId", requireAuth, requireRole('rep'), async (req: AuthRequest, res) => {
    try {
      const inquiryId = parseInt(req.params.inquiryId);
      const { subject, message } = req.body;
      
      const inquiry = await storage.getContactInquiry(inquiryId);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }

      const emailSent = await sendEmail({
        to: inquiry.email,
        from: "noreply@onyxenersol.com",
        subject: subject || `Follow-up from Onyx Energy Solutions`,
        text: message,
        html: `<p>${message.replace(/\n/g, '<br>')}</p>`
      });

      res.json({ success: emailSent, message: emailSent ? "Email sent" : "Email failed" });
    } catch (error) {
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  app.post("/api/communications/sms/:inquiryId", requireAuth, requireRole('rep'), async (req: AuthRequest, res) => {
    try {
      const inquiryId = parseInt(req.params.inquiryId);
      const { message } = req.body;
      
      const inquiry = await storage.getContactInquiry(inquiryId);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }

      const smsSent = await sendSMS({
        to: inquiry.phone,
        message: message || generateFollowUpSMS(inquiry)
      });

      res.json({ success: smsSent, message: smsSent ? "SMS sent" : "SMS failed" });
    } catch (error) {
      res.status(500).json({ error: "Failed to send SMS" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
