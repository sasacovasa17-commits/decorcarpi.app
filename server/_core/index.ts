import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import * as Sentry from "@sentry/node";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

// Initialize Sentry for error tracking
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Debug: Check if aiInteriorDesigner is in appRouter
  console.log('[DEBUG] appRouter procedures:', Object.keys(appRouter._def?.procedures || {}).filter(k => k.includes('aiInterior') || k.includes('test')));
  
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Storage proxy for /manus-storage/* paths
  registerStorageProxy(app);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Proxy download endpoint for mobile compatibility (CORS bypass)
  app.get("/api/download-image", async (req, res) => {
    try {
      const imageUrl = req.query.url as string;
      const filename = (req.query.filename as string) || "decor-carpi-preview.jpg";
      if (!imageUrl) {
        res.status(400).send("Missing url parameter");
        return;
      }
      const response = await fetch(imageUrl);
      if (!response.ok) {
        res.status(502).send("Errore di connessione image");
        return;
      }
      const contentType = response.headers.get("content-type") || "image/jpeg";
      const buffer = Buffer.from(await response.arrayBuffer());
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", buffer.length.toString());
      res.send(buffer);
    } catch {
      res.status(500).send("Download failed");
    }
  });
  
  // Debug: Log request body for tRPC calls
  app.use("/api/trpc", (req, res, next) => {
    console.log("[tRPC Request] Method:", req.method, "Path:", req.path, "Body type:", typeof req.body);
    if (req.method === "POST") {
      console.log("[tRPC Request] Body:", req.body ? JSON.stringify(req.body).substring(0, 500) : "EMPTY");
      console.log("[tRPC Request] req.body keys:", req.body ? Object.keys(req.body) : "NO BODY");
      const extractedPath = req.path.slice(req.path.lastIndexOf("/") + 1);
      console.log("[tRPC Request] Extracted path by tRPC:", extractedPath);
    }
    next();
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
