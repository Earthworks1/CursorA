import { Express } from "express";
import path from "path";
import { Server } from "http";

// Simple logging function
export function log(message: string): void {
  console.log(`[server] ${message}`);
}

// Function to serve static files in production
export function serveStatic(app: Express): void {
  // Set up static file serving for the client build
  app.use(
    "/",
    (req, res, next) => {
      // Log static file requests
      log(`Serving static file: ${req.path}`);
      next();
    },
    require("express").static(path.join(process.cwd(), "dist"))
  );

  // Catch-all route for SPA routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(process.cwd(), "dist", "index.html"));
  });
}

// Function to set up Vite dev server in development
export async function setupVite(app: Express, server: Server): Promise<void> {
  log("Development mode detected. Setting up Vite dev server...");
  
  // In development mode, Vite handles the static files
  app.get("*", (req, res, next) => {
    // For development, we'd normally integrate with Vite dev server
    // But for this simplified version, we'll just return a message
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.send("Development mode - Vite server would handle this request");
  });
}
