"use client";

import { useEffect, useState } from "react";

export function AnimatedCount({
  value,
  suffix = "",
  durationMs = 1200,
}: {
  value: number;
  suffix?: string;
  durationMs?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = Math.max(24, Math.round(durationMs / 16));

    const tick = () => {
      frame += 1;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * Math.min(1, eased)));

      if (frame < totalFrames) {
        window.requestAnimationFrame(tick);
      }
    };

    const handle = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(handle);
  }, [durationMs, value]);

  return (
    <span className="metric-count">
      {displayValue}
      {suffix}
    </span>
  );
}
