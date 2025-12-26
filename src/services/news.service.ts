import axios from "axios";
import { mapNewsResponse } from "./news.mapper";

interface FetchNewsParams {
  topic: string;
  filterBy: "relevancy" | "popularity" | "publishedAt";
  page?: number;
}

const BASE_URL = "https://newsapi.org/v2";

export const fetchNewsByTopic = async ({ topic, filterBy, page = 1 }: FetchNewsParams) => {
  const apiKey = process.env.EXTERNAL_API_KEY;
  if (!apiKey) throw new Error("Missing EXTERNAL_API_KEY");

  const url = `${BASE_URL}/everything`;
  console.log(`${url}?q=${topic}&sortBy=${filterBy}&pageSize=5`);

  try {
    const response = await axios.get(url, {
      params: {
        q: topic,
        sortBy: filterBy,
        language: "en",
        pageSize: 5,
        page,
        apiKey,
      },
      timeout: 5000, // opcional: timeout de 5 segundos
    });

    const data = response.data;

    if (data.status !== "ok") {
      throw new Error(JSON.stringify(data));
    }

    return { articles: mapNewsResponse(data.articles), totalResults: data.totalResults };
  } catch (err: any) {
    throw new Error(`Failed to fetch news: ${err.message}`);
  }
};
