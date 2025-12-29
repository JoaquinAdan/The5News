import { beforeEach, describe, expect, it, Mocked, vi } from "vitest";
import { Request, Response } from "express";

import { getNews } from "./news.controller";
import * as newsService from "../services/news.service";
import * as cacheModule from "../utils/cache";
import * as historyModule from "../utils/history";
import * as schemaModule from "../schemas/news.schema";

vi.mock("../services/news.service");
vi.mock("../utils/cache");
vi.mock("../utils/history");
vi.mock("../schemas/news.schema");

const mockedFetch = vi.mocked(newsService.fetchNewsByTopic);
const mockedCache = cacheModule as Mocked<typeof cacheModule>;
const mockedHistory = historyModule as Mocked<typeof historyModule>;
const mockedSchema = schemaModule as Mocked<typeof schemaModule>;

describe("getNews controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("responds with fetched news, saves to cache and records history when cache miss", async () => {
    const req = {
      body: {
        topic: "bitcoin",
        filterBy: "relevancy",
        page: 2,
      },
    } as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    mockedSchema.newsSchema.safeParse = vi.fn().mockReturnValue({
      success: true,
      data: { topic: "bitcoin", filterBy: "relevancy", page: 2 },
    });

    mockedCache.cache.get = vi.fn().mockResolvedValue(undefined);
    mockedCache.cache.set = vi.fn().mockResolvedValue(undefined);

    const fakeNews = [
      {
        title: "Test article",
        source: "Test Source",
        author: "Test Author",
        publishedAt: "2023-01-01T00:00:00Z",
        url: "https://test.com",
      },
    ];

    mockedFetch.mockResolvedValueOnce({
      news: fakeNews,
      totalResults: 1,
    });

    mockedHistory.addToHistory.mockResolvedValue(undefined);

    await getNews(req, res);

    const expectedCacheKey = "bitcoin:relevancy:page2";

    expect(mockedCache.cache.get).toHaveBeenCalledWith(expectedCacheKey);

    expect(mockedFetch).toHaveBeenCalledWith({
      topic: "bitcoin",
      filterBy: "relevancy",
      page: 2,
    });

    expect(mockedCache.cache.set).toHaveBeenCalledWith(
      expectedCacheKey,
      {
        totalResults: 1,
        page: 2,
        news: fakeNews,
      }
    );

    expect(mockedHistory.addToHistory).toHaveBeenCalledWith(
      "bitcoin",
      "relevancy"
    );

    expect(res.json).toHaveBeenCalledWith({
      fromCache: false,
      totalResults: 1,
      page: 2,
      news: fakeNews,
    });
  });

  it("returns cached news when cache hit", async () => {
    const req = {
      body: {
        topic: "bitcoin",
        filterBy: "relevancy",
      },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    mockedSchema.newsSchema.safeParse = vi.fn().mockReturnValue({
      success: true,
      data: {
        topic: "bitcoin",
        filterBy: "relevancy",
        page: 1,
      },
    });

    const cachedNews = [
      {
        title: "Cached article",
        source: "Cached Source",
        author: "Cached Author",
        publishedAt: "2023-01-01T00:00:00Z",
        url: "https://cached.com",
      },
    ];

    const cachedData = {
      totalResults: 1,
      page: 1,
      news: cachedNews,
    };

    mockedCache.cache.get = vi.fn().mockResolvedValue(cachedData);

    await getNews(req, res);

    expect(mockedCache.cache.get).toHaveBeenCalledWith(
      "bitcoin:relevancy:page1"
    );

    expect(mockedFetch).not.toHaveBeenCalled();

    expect(mockedHistory.addToHistory).toHaveBeenCalledWith(
      "bitcoin",
      "relevancy"
    );

    expect(res.json).toHaveBeenCalledWith({
      fromCache: true,
      totalResults: 1,
      page: 1,
      news: cachedNews,
    });
  });
});
