import { describe, expect, test } from "bun:test";
import {
  addSearchHistoryEntry,
  normalizeSearchHistory,
} from "./use-search-history";

describe("search history", () => {
  test("collapses adjacent legacy query fragments into the more specific search", () => {
    expect(normalizeSearchHistory(["da", "dag", "aero", "ero"])).toEqual([
      { query: "dag", searchedAt: 0 },
      { query: "aero", searchedAt: 0 },
    ]);
  });

  test("coalesces rapid refinements without rejecting valid short titles", () => {
    const history = addSearchHistoryEntry(
      [
        { query: "dag", searchedAt: 1_000 },
        { query: "86", searchedAt: 500 },
      ],
      "da",
      2_000,
    );

    expect(history).toEqual([
      { query: "dag", searchedAt: 2_000 },
      { query: "86", searchedAt: 500 },
    ]);
  });

  test("keeps unrelated searches as separate recent entries", () => {
    const history = addSearchHistoryEntry(
      [{ query: "Frieren", searchedAt: 1_000 }],
      "Dandadan",
      2_000,
    );

    expect(history.map((entry) => entry.query)).toEqual(["Dandadan", "Frieren"]);
  });
});
