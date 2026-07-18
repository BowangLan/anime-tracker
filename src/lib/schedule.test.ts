import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { episodeOnLocalDate, unwatchedAiredEpisodes } from "./schedule";

describe("episode progress schedule helpers", () => {
  test("selects the episode occurrence on the viewer's local date", () => {
    const morning = new Date(2026, 6, 18, 9, 0);
    const tomorrow = new Date(2026, 6, 19, 9, 0);
    const schedule = [
      { episode: 3, airingAt: Math.floor(morning.getTime() / 1000) },
      { episode: 4, airingAt: Math.floor(tomorrow.getTime() / 1000) },
    ];

    assert.equal(episodeOnLocalDate(schedule, morning)?.episode, 3);
  });

  test("keeps attention on an older gap when the latest episode is watched", () => {
    const now = Date.now();
    const schedule = [
      { episode: 1, airingAt: Math.floor((now - 20_000) / 1000) },
      { episode: 2, airingAt: Math.floor((now - 10_000) / 1000) },
    ];

    assert.deepEqual(unwatchedAiredEpisodes(schedule, new Set([2]), now).map((item) => item.episode), [1]);
  });

  test("does not treat an episode as past before its airing boundary", () => {
    const now = Date.now();
    const schedule = [{ episode: 1, airingAt: Math.floor((now + 60_000) / 1000) }];

    assert.deepEqual(unwatchedAiredEpisodes(schedule, new Set(), now), []);
  });
});
