"use client";

import { useEffect, useState } from "react";

const LG_BREAKPOINT = 1024;

export function useIsSmallScreen() {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${LG_BREAKPOINT - 1}px)`);
    setIsSmall(mql.matches);
    function handler(e: MediaQueryListEvent) {
      setIsSmall(e.matches);
    }
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isSmall;
}
