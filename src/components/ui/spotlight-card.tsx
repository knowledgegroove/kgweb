"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";

export interface GlowCardProps {
  children: ReactNode;
  className?: string;
  /** Tuned to the site's ink/rust/navy palette rather than arbitrary hues. */
  glowColor?: "rust" | "navy" | "ink";
  customSize?: boolean;
}

const glowColorMap: Record<NonNullable<GlowCardProps["glowColor"]>, { base: number; spread: number }> = {
  rust: { base: 16, spread: 26 },
  navy: { base: 205, spread: 30 },
  ink: { base: 30, spread: 8 },
};

export function GlowCard({ children, className, glowColor = "rust", customSize = false }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const card = cardRef.current;
    if (!card) return;

    function syncPointer(e: PointerEvent) {
      const rect = card!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card!.style.setProperty("--x", x.toFixed(2));
      card!.style.setProperty("--xp", (x / rect.width).toFixed(3));
      card!.style.setProperty("--y", y.toFixed(2));
    }

    window.addEventListener("pointermove", syncPointer);
    return () => window.removeEventListener("pointermove", syncPointer);
  }, []);

  const { base, spread } = glowColorMap[glowColor];

  return (
    <div
      ref={cardRef}
      data-glow
      style={
        {
          "--base": base,
          "--spread": spread,
          "--radius": "4",
          "--border": "1",
          "--spotlight-size": "420",
          "--hue": "calc(var(--base) + (var(--xp, 0.5) * var(--spread)))",
        } as CSSProperties
      }
      className={clsx(
        "group/glow relative isolate overflow-hidden border border-border-strong bg-surface",
        !customSize && "aspect-[4/3]",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/glow:opacity-100"
        style={{
          background: `radial-gradient(
            calc(var(--spotlight-size) * 1px) calc(var(--spotlight-size) * 1px) at
            calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
            hsl(var(--hue, 16) 55% 46% / 0.1),
            transparent 70%
          )`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/glow:opacity-100"
        style={{
          background: `radial-gradient(
            180px 180px at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
            hsl(var(--hue, 16) 60% 40% / 0.35),
            transparent 100%
          )`,
          mixBlendMode: "multiply",
        }}
      />
      {children}
    </div>
  );
}
