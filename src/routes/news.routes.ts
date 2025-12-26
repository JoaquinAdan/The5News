import { Router } from "express";
import { getNews } from "../controllers/news.controller";

const router = Router();

router.post("/", getNews);

export default router;
