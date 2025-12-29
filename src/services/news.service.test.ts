import axios from "axios";
import { beforeEach, describe, expect, it, Mocked, vi } from "vitest";
import { fetchNewsByTopic } from "../services/news.service";

vi.mock("axios");

const mockedAxios = axios as Mocked<typeof axios>;

describe("fetchNewsByTopic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EXTERNAL_API_KEY = "test-key";
  });
  
  it("returns mapped articles", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: "ok",
        articles: [
          {
            title: "Test",
            source: { name: "Source" },
            author: "Author",
            publishedAt: "2025-12-26T00:00:00Z",
            url: "url",
          },
        ],
        totalResults: 1,
      },
    });

    const result = await fetchNewsByTopic({
      topic: "bitcoin",
      filterBy: "relevancy",
    });

    expect(result.news[0].title).toBe("Test");
    expect(result.totalResults).toBe(1);
  });

  it("calls axios with correct parameters including page", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: "ok",
        articles: [],
        totalResults: 0,
      },
    });

    await fetchNewsByTopic({
      topic: "ethereum",
      filterBy: "popularity",
      page: 3,
    });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://newsapi.org/v2/everything",
      {
        params: {
          q: "ethereum",
          sortBy: "popularity",
          language: "en",
          pageSize: 5,
          page: 3,
          apiKey: "test-key",
        },
        timeout: 5000,
      }
    );
  });

  it("uses default page value of 1 when page is not provided", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: "ok",
        articles: [],
        totalResults: 0,
      },
    });

    await fetchNewsByTopic({
      topic: "crypto",
      filterBy: "publishedAt",
    });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://newsapi.org/v2/everything",
      expect.objectContaining({
        params: expect.objectContaining({
          page: 1,
        }),
      })
    );
  });

  it("returns multiple mapped articles correctly", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: "ok",
        articles: [
          {
            title: "Article 1",
            source: { name: "Source 1" },
            author: "Author 1",
            publishedAt: "2025-12-26T10:00:00Z",
            url: "https://example.com/1",
          },
          {
            title: "Article 2",
            source: { name: "Source 2" },
            author: "Author 2",
            publishedAt: "2025-12-26T11:00:00Z",
            url: "https://example.com/2",
          },
          {
            title: "Article 3",
            source: { name: "Source 3" },
            author: "Author 3",
            publishedAt: "2025-12-26T12:00:00Z",
            url: "https://example.com/3",
          },
        ],
        totalResults: 150,
      },
    });

    const result = await fetchNewsByTopic({
      topic: "technology",
      filterBy: "relevancy",
    });

    expect(result.news).toHaveLength(3);
    expect(result.news[0]).toEqual({
      title: "Article 1",
      source: "Source 1",
      author: "Author 1",
      publishedAt: "2025-12-26T10:00:00Z",
      url: "https://example.com/1",
    });
    expect(result.news[1].title).toBe("Article 2");
    expect(result.news[2].title).toBe("Article 3");
    expect(result.totalResults).toBe(150);
  });

  it("handles non-Error objects in catch block", async () => {
    mockedAxios.get.mockRejectedValueOnce("String error");

    await expect(
      fetchNewsByTopic({
        topic: "bitcoin",
        filterBy: "relevancy",
      })
    ).rejects.toThrow("Failed to fetch news: String error");
  });

  it("throws an error when API status is not ok", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: "error",
        message: "Invalid API key",
      },
    });

    await expect(
      fetchNewsByTopic({
        topic: "bitcoin",
        filterBy: "relevancy",
      })
    ).rejects.toThrow('Failed to fetch news: {"status":"error","message":"Invalid API key"}');
  });

  it("throws a formatted error when axios request fails", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

    await expect(
      fetchNewsByTopic({
        topic: "bitcoin",
        filterBy: "relevancy",
      })
    ).rejects.toThrow("Failed to fetch news: Network Error");
  });

  it("throws an error when EXTERNAL_API_KEY is missing", async () => {
    delete process.env.EXTERNAL_API_KEY;

    await expect(
      fetchNewsByTopic({
        topic: "bitcoin",
        filterBy: "relevancy",
      })
    ).rejects.toThrow("Missing EXTERNAL_API_KEY");

    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});
