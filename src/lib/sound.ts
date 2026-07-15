"use client";

import { play, type SoundName } from "cuelume";

// cuelume synthesizes every interaction cue live via Web Audio — no files, no
// deps. Sound is always on; `bind()` + engine setup live in SoundProvider.

/**
 * Play an interaction cue. A thin, safe wrapper over cuelume's `play`: the
 * engine no-ops during SSR and when Web Audio is unavailable, so callers never
 * need to guard.
 */
export function cue(sound: SoundName) {
  play(sound);
}
