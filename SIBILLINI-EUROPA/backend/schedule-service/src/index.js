import cors from "cors";
import express from "express";
import morgan from "morgan";

const app = express();
const port = 4104;

const events = [];

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ service: "schedule-service", status: "ok", timestamp: new Date().toISOString() });
});

app.get("/schedule/events", (_req, res) => {
  res.json({ items: events });
});

app.post("/schedule/events", (req, res) => {
  const title = String(req.body?.title || "").trim();
  const day = String(req.body?.day || "").trim();

  if (!title || !day) {
    return res.status(400).json({ error: "title and day are required" });
  }

  const item = {
    id: `evt-${Date.now()}`,
    day,
    startTime: String(req.body?.startTime || "09:00"),
    endTime: String(req.body?.endTime || "10:00"),
    title,
    description: String(req.body?.description || "").trim(),
    location: String(req.body?.location || "").trim(),
    updatedAt: new Date().toISOString()
  };

  events.push(item);
  return res.status(201).json(item);
});

app.listen(port, () => {
  console.log(`[schedule-service] listening on port ${port}`);
});
