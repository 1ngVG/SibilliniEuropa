import cors from "cors";
import express from "express";
import morgan from "morgan";

const app = express();
const port = 4102;

const sections = [
  {
    id: "home-hero",
    title: "Sibillini Europa",
    body: "Summer School dedicata all'Europa e ai giovani.",
    status: "published",
    updatedAt: new Date().toISOString()
  }
];

const articles = [];

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ service: "content-service", status: "ok", timestamp: new Date().toISOString() });
});

app.get("/content/sections", (_req, res) => {
  res.json({ items: sections });
});

app.post("/content/sections", (req, res) => {
  const title = String(req.body?.title || "").trim();
  const body = String(req.body?.body || "").trim();

  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  const item = {
    id: `sec-${Date.now()}`,
    title,
    body,
    status: "draft",
    updatedAt: new Date().toISOString()
  };

  sections.push(item);
  return res.status(201).json(item);
});

app.get("/content/articles", (_req, res) => {
  res.json({ items: articles });
});

app.post("/content/articles", (req, res) => {
  const title = String(req.body?.title || "").trim();

  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  const item = {
    id: `art-${Date.now()}`,
    title,
    excerpt: String(req.body?.excerpt || "").trim(),
    body: String(req.body?.body || "").trim(),
    status: "draft",
    updatedAt: new Date().toISOString()
  };

  articles.push(item);
  return res.status(201).json(item);
});

app.listen(port, () => {
  console.log(`[content-service] listening on port ${port}`);
});
