"use client";

import { useEffect } from "react";
import { bind } from "cuelume";

/**
 * Boots cuelume once on the client: `bind()` wires up every `data-cuelume-*`
 * attribute in the tree (delegated, so later DOM additions work too). Sound is
 * always on. Renders nothing.
 */
export function SoundProvider() {
  useEffect(() => {
    bind();
  }, []);

  return null;
}
