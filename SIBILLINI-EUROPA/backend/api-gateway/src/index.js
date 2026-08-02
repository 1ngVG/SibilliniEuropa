import "dotenv/config";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const port = Number(process.env.PORT || 8080);

const serviceTargets = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:4101",
  content: process.env.CONTENT_SERVICE_URL || "http://localhost:4102",
  media: process.env.MEDIA_SERVICE_URL || "http://localhost:4103",
  schedule: process.env.SCHEDULE_SERVICE_URL || "http://localhost:4104"
};

app.use(cors());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({
    service: "api-gateway",
    status: "ok",
    timestamp: new Date().toISOString(),
    targets: serviceTargets
  });
});

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: serviceTargets.auth,
    changeOrigin: true,
    pathRewrite: (path) => `/auth${path}`
  })
);

app.use(
  "/api/content",
  createProxyMiddleware({
    target: serviceTargets.content,
    changeOrigin: true,
    pathRewrite: (path) => `/content${path}`
  })
);

app.use(
  "/api/media",
  createProxyMiddleware({
    target: serviceTargets.media,
    changeOrigin: true,
    pathRewrite: (path) => `/media${path}`
  })
);

app.use(
  "/api/schedule",
  createProxyMiddleware({
    target: serviceTargets.schedule,
    changeOrigin: true,
    pathRewrite: (path) => `/schedule${path}`
  })
);

app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `No route defined for ${req.method} ${req.originalUrl}`
  });
});

app.listen(port, () => {
  console.log(`[api-gateway] listening on port ${port}`);
});
