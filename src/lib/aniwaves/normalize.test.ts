import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTitle, uniqueTitles } from "./normalize";

test("normalizeTitle makes punctuation and accents comparable", () => {
  assert.equal(normalizeTitle("Pokémon: The First Movie"), "pokemon the first movie");
  assert.equal(normalizeTitle("Spy × Family"), "spy family");
  assert.equal(normalizeTitle("Dubs & Subs"), "dubs and subs");
});

test("uniqueTitles preserves the first display value", () => {
  assert.deepEqual(uniqueTitles(["Bungo Stray Dogs", " bungo-stray dogs ", null, "文豪ストレイドッグス"]), [
    "Bungo Stray Dogs",
    "文豪ストレイドッグス",
  ]);
});
