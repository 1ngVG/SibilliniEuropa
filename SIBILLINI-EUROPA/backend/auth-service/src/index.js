import cors from "cors";
import express from "express";
import morgan from "morgan";

const app = express();
const port = 4101;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ service: "auth-service", status: "ok", timestamp: new Date().toISOString() });
});

app.post("/auth/session", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  const role = email.endsWith("@sibillinieuropa.eu") ? "admin" : "editor";

  return res.json({
    user: {
      email,
      role,
      provider: "google-workspace"
    },
    token: "stub-token"
  });
});

app.listen(port, () => {
  console.log(`[auth-service] listening on port ${port}`);
});
