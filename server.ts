import express from "express";
import { createServer as createViteServer } from "vite";
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import path from "path";

// Initialize Firebase Admin
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    let serviceAccount;
    try {
      // Parse the JSON string from the environment variable
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (parseError) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT.startsWith('AIza')) {
        console.error("🔥 CRITICAL ERROR: The FIREBASE_SERVICE_ACCOUNT secret contains a Web API Key (AIza...) instead of a Service Account JSON object.");
        console.error("Please go to Firebase Console > Project Settings > Service Accounts > Generate New Private Key, and paste the ENTIRE contents of the downloaded .json file into the secret.");
      } else {
        console.error("🔥 CRITICAL ERROR: The FIREBASE_SERVICE_ACCOUNT secret is not valid JSON.", parseError);
      }
      throw parseError; // Prevent initialization with invalid data
    }

    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log("Firebase Admin initialized successfully using FIREBASE_SERVICE_ACCOUNT secret.");
  } else {
    // Fallback if deployed in an environment with default credentials
    initializeApp({
      credential: applicationDefault(),
    });
    console.log("Firebase Admin initialized using applicationDefault().");
  }
} catch (e) {
  console.error("Firebase Admin initialization error:", e);
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
