var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  contactInquiries: () => contactInquiries,
  contactInquiriesRelations: () => contactInquiriesRelations,
  insertContactInquirySchema: () => insertContactInquirySchema,
  insertUserSchema: () => insertUserSchema,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var contactInquiries = pgTable("contact_inquiries", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  monthlyBill: text("monthly_bill").notNull(),
  quoteType: text("quote_type").notNull().default("residential"),
  // residential or commercial
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var usersRelations = relations(users, ({ many }) => ({
  contactInquiries: many(contactInquiries)
}));
var contactInquiriesRelations = relations(contactInquiries, ({ one }) => ({
  user: one(users, {
    fields: [contactInquiries.id],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertContactInquirySchema = createInsertSchema(contactInquiries).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async createContactInquiry(insertInquiry) {
    const [inquiry] = await db.insert(contactInquiries).values(insertInquiry).returning();
    return inquiry;
  }
  async getContactInquiries() {
    return await db.select().from(contactInquiries);
  }
  async getContactInquiry(id) {
    const [inquiry] = await db.select().from(contactInquiries).where(eq(contactInquiries.id, id));
    return inquiry || void 0;
  }
};
var storage = new DatabaseStorage();

// server/email.ts
import { MailService } from "@sendgrid/mail";
if (process.env.SENDGRID_API_KEY) {
  const mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}
async function sendEmail(params) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log("SendGrid API key not configured. Email would be sent:", {
        to: params.to,
        from: params.from,
        subject: params.subject,
        text: params.text
      });
      return true;
    }
    const mailService = new MailService();
    mailService.setApiKey(process.env.SENDGRID_API_KEY);
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || "",
      html: params.html || ""
    });
    console.log("Email sent successfully to:", params.to);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
}
function generateContactEmailHtml(inquiry) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #f59e0b; color: black; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { background-color: #1f2937; color: #f59e0b; padding: 15px; text-align: center; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #f59e0b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>New Solar Quote Request - Onyx Energy Solutions</h1>
      </div>
      
      <div class="content">
        <h2>Contact Information</h2>
        <div class="field">
          <span class="label">Name:</span> ${inquiry.firstName} ${inquiry.lastName}
        </div>
        <div class="field">
          <span class="label">Email:</span> ${inquiry.email}
        </div>
        <div class="field">
          <span class="label">Phone:</span> ${inquiry.phone}
        </div>
        <div class="field">
          <span class="label">Address:</span> ${inquiry.address}
        </div>
        <div class="field">
          <span class="label">Monthly Electric Bill:</span> $${inquiry.monthlyBill}
        </div>
        
        <h2>Message</h2>
        <div class="field">
          ${inquiry.message || "No additional message provided."}
        </div>
        
        <h2>Estimated Savings</h2>
        <div class="field">
          Based on their monthly bill of $${inquiry.monthlyBill}:
          <ul>
            <li>Annual Savings: $${Math.round(parseFloat(inquiry.monthlyBill) * 12 * 0.9)}</li>
            <li>20-Year Savings: $${Math.round(parseFloat(inquiry.monthlyBill) * 12 * 0.9 * 20)}</li>
          </ul>
        </div>
      </div>
      
      <div class="footer">
        <p><strong>Onyx Energy Solutions</strong></p>
        <p>Gold Standards Keeping You in the Black</p>
        <p>Call them at: <strong>(401) 216-8890</strong></p>
      </div>
    </body>
    </html>
  `;
}
function generateContactEmailText(inquiry) {
  return `
New Solar Quote Request - Onyx Energy Solutions

Contact Information:
Name: ${inquiry.firstName} ${inquiry.lastName}
Email: ${inquiry.email}
Phone: ${inquiry.phone}
Address: ${inquiry.address}
Monthly Electric Bill: $${inquiry.monthlyBill}

Message:
${inquiry.message || "No additional message provided."}

Estimated Savings:
Based on their monthly bill of $${inquiry.monthlyBill}:
- Annual Savings: $${Math.round(parseFloat(inquiry.monthlyBill) * 12 * 0.9)}
- 20-Year Savings: $${Math.round(parseFloat(inquiry.monthlyBill) * 12 * 0.9 * 20)}

---
Onyx Energy Solutions
Gold Standards Keeping You in the Black
Call them at: (401) 216-8890
  `;
}

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactInquirySchema.parse(req.body);
      const inquiry = await storage.createContactInquiry(validatedData);
      try {
        const emailSent = await sendEmail({
          to: "info@onyxenersol.com",
          // Company email
          from: "noreply@onyxenersol.com",
          // From address
          subject: `New Solar Quote Request from ${inquiry.firstName} ${inquiry.lastName}`,
          text: generateContactEmailText(inquiry),
          html: generateContactEmailHtml(inquiry)
        });
        console.log(`Email notification ${emailSent ? "sent" : "failed"} for inquiry ${inquiry.id}`);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
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
  app2.get("/api/contact", async (req, res) => {
    try {
      const inquiries = await storage.getContactInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });
  app2.get("/api/contact/:id", async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
