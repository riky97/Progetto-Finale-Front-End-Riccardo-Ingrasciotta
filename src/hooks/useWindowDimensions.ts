import { useEffect, useState } from "react";

/** Single source of truth for the mobile breakpoint used across the layout. */
export const MOBILE_BREAKPOINT = 768;

export interface WindowDimensions {
  width: number;
  height: number;
  /** `true` at or below {@link MOBILE_BREAKPOINT}. */
  isMobile: boolean;
}

function readDimensions(): WindowDimensions {
  const { innerWidth: width, innerHeight: height } = window;
  return { width, height, isMobile: width <= MOBILE_BREAKPOINT };
}

export default function useWindowDimensions(): WindowDimensions {
  const [dimensions, setDimensions] = useState<WindowDimensions>(readDimensions);

  useEffect(() => {
    let frame = 0;
    const handleResize = () => {
      // Coalesce resize bursts into one state update per frame.
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setDimensions(readDimensions()));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return dimensions;
}
