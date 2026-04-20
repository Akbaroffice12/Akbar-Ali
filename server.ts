import express from "express";
import { createServer as createViteServer } from "vite";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import path from "path";

// Initialize Firebase Admin
// This uses the GOOGLE_APPLICATION_CREDENTIALS environment variable
try {
  initializeApp({
    credential: applicationDefault(),
  });
  console.log("Firebase Admin initialized successfully.");
} catch (e) {
  console.error("Firebase Admin initialization error. Make sure GOOGLE_APPLICATION_CREDENTIALS is set:", e);
}

async function getAccessToken() {
  try {
    const accessToken = await applicationDefault().getAccessToken();
    return accessToken.access_token;
  } catch (err) {
    console.error('Unable to get access token');
    console.error(err);
    throw err;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Endpoint to test the getAccessToken function
  app.get("/api/token", async (req, res) => {
    try {
      const token = await getAccessToken();
      res.json({ token });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get token" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
