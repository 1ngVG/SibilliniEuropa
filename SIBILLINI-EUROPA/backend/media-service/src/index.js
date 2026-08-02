import cors from "cors";
import express from "express";
import morgan from "morgan";

const app = express();
const port = 4103;

const assets = [];

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ service: "media-service", status: "ok", timestamp: new Date().toISOString() });
});

app.get("/media/assets", (_req, res) => {
  res.json({ items: assets });
});

app.post("/media/assets", (req, res) => {
  const fileName = String(req.body?.fileName || "").trim();

  if (!fileName) {
    return res.status(400).json({ error: "fileName is required" });
  }

  const item = {
    id: `asset-${Date.now()}`,
    fileName,
    contentType: String(req.body?.contentType || "image/jpeg"),
    storagePath: `media/${fileName}`,
    publicUrl: `https://cdn.sibillinieuropa.eu/media/${encodeURIComponent(fileName)}`,
    createdAt: new Date().toISOString()
  };

  assets.push(item);
  return res.status(201).json(item);
});

app.listen(port, () => {
  console.log(`[media-service] listening on port ${port}`);
});
