import { beforeEach, describe, expect, it, vi } from "vitest";
import { Request, Response } from "express";
import { getHistory } from "./history.controller";
import * as historyModule from "../utils/history";

vi.mock("../utils/history");

describe("getHistory controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the news history array", () => {
    const req = {} as Request;
    const res = {
      json: vi.fn(),
    } as unknown as Response;

    const mockHistory = [
      {
        topic: "bitcoin",
        filterBy: "relevancy",
        requestedAt: "2025-12-26T10:00:00.000Z",
        failed: false,
      },
      {
        topic: "ethereum",
        filterBy: "popularity",
        requestedAt: "2025-12-26T11:00:00.000Z",
        failed: false,
      },
    ];

    vi.mocked(historyModule.newsHistory).push(...mockHistory);

    getHistory(req, res);

    expect(res.json).toHaveBeenCalledWith(historyModule.newsHistory);
  });

  it("returns empty array when no history exists", () => {
    const req = {} as Request;
    const res = {
      json: vi.fn(),
    } as unknown as Response;

    vi.mocked(historyModule.newsHistory).length = 0;

    getHistory(req, res);

    expect(res.json).toHaveBeenCalledWith(historyModule.newsHistory);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([]));
  });

  it("returns history including failed requests", () => {
    const req = {} as Request;
    const res = {
      json: vi.fn(),
    } as unknown as Response;

    const mockHistoryWithFailures = [
      {
        topic: "bitcoin",
        filterBy: "relevancy",
        requestedAt: "2025-12-26T10:00:00.000Z",
        failed: false,
      },
      {
        topic: null,
        filterBy: null,
        requestedAt: "2025-12-26T11:00:00.000Z",
        failed: true,
      },
    ];

    vi.mocked(historyModule.newsHistory).push(...mockHistoryWithFailures);

    getHistory(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ failed: false }),
        expect.objectContaining({ failed: true, topic: null, filterBy: null }),
      ])
    );
  });
});
