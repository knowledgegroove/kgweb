"use client";

import { useEffect, useRef } from "react";
import { renderLineTrail, type LineTrailOptions } from "./canvas";
import { cn } from "@/lib/utils";

export function CanvasTrail({ className, options }: { className?: string; options?: LineTrailOptions }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    return renderLineTrail(canvas, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
