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
    mockedFetch.mockResolvedValueOnce({ news: fakeNews, totalResults: 1 });

    vi.mocked(historyModule.addToHistory).mockResolvedValue(undefined);

    await getNews(req, res);

    const expectedCacheKey = "bitcoin:relevancy:page2";
    expect(mockedCache.cache.get).toHaveBeenCalledWith(expectedCacheKey);
    expect(mockedFetch).toHaveBeenCalledWith({
      topic: "bitcoin",
      filterBy: "relevancy",
      page: 2,
    });
    expect(mockedCache.cache.set).toHaveBeenCalledWith(expectedCacheKey, {
      totalResults: 1,
      page: 2,
      news: fakeNews,
    });
    expect(mockedHistory.addToHistory).toHaveBeenCalledWith("bitcoin", "relevancy");

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

    const cachedNews = {
      totalResults: 1,
      page: 1,
      news: [
        {
          title: "Cached article",
          source: "Cached Source",
          author: "Cached Author",
          publishedAt: "2023-01-01T00:00:00Z",
          url: "https://cached.com",
        },
      ],
    };

    mockedCache.cache.get = vi.fn().mockResolvedValue(cachedNews);

    await getNews(req, res);

    expect(mockedCache.cache.get).toHaveBeenCalledWith("bitcoin:relevancy:page1");
    expect(mockedFetch).not.toHaveBeenCalled();
    expect(mockedHistory.addToHistory).toHaveBeenCalledWith("bitcoin", "relevancy");
    expect(res.json).toHaveBeenCalledWith({
      fromCache: true,
      totalResults: 1,
      page: 1,
      news: cachedNews.news,
    });
  });

  it("returns 400 error when validation fails", async () => {
    const req = {
      body: {
        topic: "ab",
        filterBy: "invalid",
      },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    mockedSchema.newsSchema.safeParse = vi.fn().mockReturnValue({
      success: false,
      error: {
        issues: [
          {
            path: ["topic"],
            message: "Topic is too short. Minimum 3 characters required.",
          },
          {
            path: ["filterBy"],
            message: "Invalid enum value",
          },
        ],
      },
    });

    await getNews(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: [
        {
          field: "topic",
          message: "Topic is too short. Minimum 3 characters required.",
        },
        {
          field: "filterBy",
          message: "Invalid enum value",
        },
      ],
    });
    expect(mockedHistory.addToHistory).toHaveBeenCalledWith("ab", "invalid", true);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("handles validation error with missing topic and filterBy", async () => {
    const req = {
      body: {},
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    mockedSchema.newsSchema.safeParse = vi.fn().mockReturnValue({
      success: false,
      error: {
        issues: [
          {
            path: ["topic"],
            message: "Required",
          },
        ],
      },
    });

    await getNews(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedHistory.addToHistory).toHaveBeenCalledWith(null, null, true);
  });

  it("returns 500 error when fetchNewsByTopic throws an Error", async () => {
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
      data: { topic: "bitcoin", filterBy: "relevancy", page: 1 },
    });

    mockedCache.cache.get = vi.fn().mockResolvedValue(undefined);

    const errorMessage = "API rate limit exceeded";
    mockedFetch.mockRejectedValueOnce(new Error(errorMessage));

    await getNews(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to fetch news data",
      details: errorMessage,
    });
  });

  it("returns 500 error when fetchNewsByTopic throws a non-Error", async () => {
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
      data: { topic: "bitcoin", filterBy: "relevancy", page: 1 },
    });

    mockedCache.cache.get = vi.fn().mockResolvedValue(undefined);

    mockedFetch.mockRejectedValueOnce("String error");

    await getNews(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to fetch news data",
      details: "String error",
    });
  });

  it("uses default filterBy value when not provided", async () => {
    const req = {
      body: {
        topic: "bitcoin",
      },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    mockedSchema.newsSchema.safeParse = vi.fn().mockReturnValue({
      success: true,
      data: { topic: "bitcoin", filterBy: undefined, page: undefined },
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
    mockedFetch.mockResolvedValueOnce({ news: fakeNews, totalResults: 1 });

    await getNews(req, res);

    expect(mockedFetch).toHaveBeenCalledWith({
      topic: "bitcoin",
      filterBy: "publishedAt",
      page: 1,
    });
    expect(mockedHistory.addToHistory).toHaveBeenCalledWith("bitcoin", "publishedAt");
    expect(res.json).toHaveBeenCalledWith({
      fromCache: false,
      totalResults: 1,
      page: 1,
      news: fakeNews,
    });
  });

  it("handles validation error with empty path (unknown field)", async () => {
    const req = {
      body: {
        topic: "bitcoin",
        invalidField: "something",
      },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    mockedSchema.newsSchema.safeParse = vi.fn().mockReturnValue({
      success: false,
      error: {
        issues: [
          {
            path: [],
            message: "Unrecognized key in object",
          },
        ],
      },
    });

    await getNews(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: [
        {
          field: "unknown field",
          message: "Unrecognized key in object",
        },
      ],
    });
  });
});
