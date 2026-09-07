"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import clsx from "clsx";

export interface GlowCardProps {
  children: ReactNode;
  className?: string;
  customSize?: boolean;
}

const MAX_TILT_DEG = 7;
const LIFT_PX = 10;

const ENTER_TRANSITION = "transform 120ms ease-out, box-shadow 300ms ease-out, border-color 300ms ease-out";
const LEAVE_TRANSITION =
  "transform 500ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 400ms ease-out, border-color 400ms ease-out";

/**
 * A card that tilts in 3D toward the cursor and lifts off the page on
 * hover, resetting smoothly on leave. Pure transform-based (no color
 * tied to pointer position) — respects prefers-reduced-motion.
 */
export function GlowCard({ children, className, customSize = false }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useRef(false);

  function handleEnter() {
    reduceMotion.current =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = ENTER_TRANSITION;
  }

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card || reduceMotion.current) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rx = (-py * MAX_TILT_DEG).toFixed(2);
    const ry = (px * MAX_TILT_DEG).toFixed(2);
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-${LIFT_PX}px)`;
  }

  function handleLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = LEAVE_TRANSITION;
    card.style.transform = reduceMotion.current
      ? "none"
      : "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  }

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={clsx(
        "relative border border-border-strong bg-surface will-change-transform",
        "shadow-[0_1px_3px_rgba(26,23,18,0.07)]",
        "transition-[box-shadow,border-color] duration-300 ease-out",
        "hover:border-accent/50 hover:shadow-[0_32px_56px_-22px_rgba(26,23,18,0.38)]",
        !customSize && "aspect-[4/3]",
        className
      )}
    >
      {children}
    </div>
  );
}
