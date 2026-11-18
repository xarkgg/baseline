import { useEffect } from "react";

import { CustomCursor } from "@/lib/mouse-animations/animations/cursor";
import { Trail } from "@/lib/mouse-animations/animations/trail";

export default function CustomMouseCursor() {
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    const cursor = new CustomCursor({
      innerSize: 9,
      outerSize: 24,
      // The ground is dark on every page, so the cursor reads light.
      innerColor: "oklch(0.955 0.005 95)",
      outerColor: "oklch(0.955 0.005 95 / 0.5)",
      smoothness: 0.24,
      hideDefault: true,
    });
    const trail = new Trail({
      color: "oklch(0.78 0.13 174 / 0.28)",
      size: 3,
      length: 10,
      decay: 0.14,
    });

    return () => {
      trail.destroy();
      cursor.destroy();
    };
  }, []);

  return null;
}
