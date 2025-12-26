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
        news: [
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
