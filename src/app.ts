import express from "express";
import newsRoutes from "./routes/news.routes";
import historyRoutes from "./routes/history.routes";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/history", historyRoutes);
app.use("/news", newsRoutes);

export default app;
