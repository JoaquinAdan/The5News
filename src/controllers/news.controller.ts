import { Request, Response } from "express";
import { fetchNewsByTopic } from "../services/news.service";
import { cache } from "../utils/cache";
import { addToHistory } from "../utils/history";
import { newsSchema } from "../schemas/news.schema";

export const getNews = async (req: Request, res: Response) => {
  try {
    //! Validate request body
    const parsed = newsSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.issues.map((issue) => {
        const field = issue.path.join(".") || "unknown field";
        return { field: field, message: issue.message };
      });

      const topic = req.body.topic || null;
      const filterBy = req.body.filterBy || null;
      addToHistory(topic, filterBy, true);

      return res.status(400).json({ errors: messages });
    }

    const { topic, filterBy, page } = parsed.data;
    const sortBy = filterBy || "publishedAt";
    const pageNumber = page || 1;
    const cacheKey = `${topic}:${sortBy}:page${pageNumber}`;

    //! Check cache
    const cached = await cache.get(cacheKey);
    if (cached !== undefined) {
      addToHistory(topic, sortBy);
      return res.json({ fromCache: true, news: cached });
    }

    //! Fetch news data
    const { news, totalResults } = await fetchNewsByTopic({ topic, filterBy: sortBy, page: pageNumber });
    await cache.set(cacheKey, news);
    addToHistory(topic, sortBy);

    return res.json({ fromCache: false, totalResults, page: pageNumber, news });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: "Failed to fetch news data", details: message });
  }
};
