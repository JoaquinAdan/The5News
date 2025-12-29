import { describe, expect, it } from "vitest";
import { mapNewsResponse } from "./news.mapper";

describe("mapNewsResponse", () => {
  it("maps a single news article correctly", () => {
    const input = [
      {
        title: "Bitcoin reaches new high",
        source: { name: "CryptoNews" },
        author: "John Doe",
        publishedAt: "2025-12-26T10:00:00Z",
        url: "https://example.com/bitcoin-high",
      },
    ];

    const result = mapNewsResponse(input);

    expect(result).toEqual([
      {
        title: "Bitcoin reaches new high",
        source: "CryptoNews",
        author: "John Doe",
        publishedAt: "2025-12-26T10:00:00Z",
        url: "https://example.com/bitcoin-high",
      },
    ]);
  });

  it("maps multiple news articles correctly", () => {
    const input = [
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
    ];

    const result = mapNewsResponse(input);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      title: "Article 1",
      source: "Source 1",
      author: "Author 1",
      publishedAt: "2025-12-26T10:00:00Z",
      url: "https://example.com/1",
    });
    expect(result[1].source).toBe("Source 2");
    expect(result[2].title).toBe("Article 3");
  });

  it("returns empty array when input is empty", () => {
    const input: any[] = [];

    const result = mapNewsResponse(input);

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it("correctly extracts source.name from nested object", () => {
    const input = [
      {
        title: "Test Article",
        source: { name: "Nested Source Name" },
        author: "Test Author",
        publishedAt: "2025-12-26T10:00:00Z",
        url: "https://test.com",
      },
    ];

    const result = mapNewsResponse(input);

    expect(result[0].source).toBe("Nested Source Name");
    expect(typeof result[0].source).toBe("string");
  });

  it("preserves all field values during mapping", () => {
    const input = [
      {
        title: "Specific Title",
        source: { name: "Specific Source" },
        author: "Specific Author",
        publishedAt: "2025-12-28T15:30:45.123Z",
        url: "https://specific.com/article/123",
      },
    ];

    const result = mapNewsResponse(input);

    expect(result[0]).toEqual({
      title: "Specific Title",
      source: "Specific Source",
      author: "Specific Author",
      publishedAt: "2025-12-28T15:30:45.123Z",
      url: "https://specific.com/article/123",
    });
  });

  it("handles articles with null or empty string values", () => {
    const input = [
      {
        title: "",
        source: { name: "" },
        author: "",
        publishedAt: "",
        url: "",
      },
    ];

    const result = mapNewsResponse(input);

    expect(result[0]).toEqual({
      title: "",
      source: "",
      author: "",
      publishedAt: "",
      url: "",
    });
  });
});
