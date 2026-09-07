"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import clsx from "clsx";
import type { Episode } from "@/lib/data";
import { EPISODE_COVERS } from "./EpisodeCover";

const AUTO_MS = 4500;
const STEP_PERCENT = 58;

export function EpisodeCarousel({ episodes, spotifyHref }: { episodes: Episode[]; spotifyHref: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const count = episodes.length;

  useEffect(() => {
    if (reduceMotion || paused || count < 2) return;
    const id = setInterval(() => setActive((a) => (a + 1) % count), AUTO_MS);
    return () => clearInterval(id);
  }, [count, paused, reduceMotion]);

  function go(delta: number) {
    setActive((a) => (a + delta + count) % count);
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative h-[420px] sm:h-[480px] [perspective:1400px]">
        {episodes.map((ep, i) => {
          let offset = i - active;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;
          const abs = Math.abs(offset);
          const isActive = offset === 0;
          const visible = abs <= 2;
          const cover = EPISODE_COVERS[i % EPISODE_COVERS.length];
          const Cover = cover.render;

          return (
            <motion.div
              key={ep.title}
              className="absolute left-1/2 top-0 w-[240px] sm:w-[290px]"
              style={{ zIndex: 10 - abs }}
              initial={false}
              animate={{
                x: `calc(-50% + ${offset * STEP_PERCENT}%)`,
                scale: isActive ? 1 : 0.84,
                opacity: visible ? (isActive ? 1 : 0.5) : 0,
                rotateY: isActive ? 0 : offset > 0 ? -12 : 12,
              }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <a
                href={isActive ? spotifyHref : undefined}
                target={isActive ? "_blank" : undefined}
                rel={isActive ? "noopener noreferrer" : undefined}
                onClick={(e) => {
                  if (!isActive) {
                    e.preventDefault();
                    setActive(i);
                  }
                }}
                aria-label={isActive ? `Listen to ${ep.title} on Spotify` : `Show ${ep.title}`}
                aria-hidden={visible ? undefined : true}
                tabIndex={visible ? undefined : -1}
                className={clsx(
                  "focus-ring group relative block aspect-[3/4] w-full overflow-hidden border",
                  isActive
                    ? "cursor-pointer border-border-strong shadow-[0_32px_56px_-20px_rgba(26,23,18,0.4)]"
                    : "cursor-pointer border-transparent"
                )}
              >
                <Cover />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141110] via-[#141110]/50 to-transparent" />
                <span className="absolute right-3 top-3 rounded-full bg-black/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-white/85 backdrop-blur-sm">
                  {cover.tag}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <h3 className="font-display text-lg leading-snug text-white sm:text-xl">{ep.title}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/75 sm:text-sm">
                    {ep.description}
                  </p>
                  <div className="numeral mt-3 text-[11px] text-white/55">
                    {ep.date} &middot; {ep.duration}
                  </div>
                </div>
              </a>
            </motion.div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous episode"
        className="focus-ring absolute left-0 top-[210px] -translate-y-1/2 sm:top-[240px] inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground transition-colors hover:border-accent hover:text-accent"
      >
        <CaretLeft size={16} weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next episode"
        className="focus-ring absolute right-0 top-[210px] -translate-y-1/2 sm:top-[240px] inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground transition-colors hover:border-accent hover:text-accent"
      >
        <CaretRight size={16} weight="bold" />
      </button>

      <div className="mt-8 flex justify-center gap-2">
        {episodes.map((ep, i) => (
          <button
            key={ep.title}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Go to ${ep.title}`}
            aria-current={i === active}
            className={clsx(
              "focus-ring h-1.5 rounded-full transition-all duration-300",
              i === active ? "w-6 bg-accent" : "w-1.5 bg-border-strong hover:bg-muted-dim"
            )}
          />
        ))}
      </div>
    </div>
  );
}
