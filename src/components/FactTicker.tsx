"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Fact } from "@/lib/data";

const INTERVAL_MS = 2800;

export function FactTicker({ facts }: { facts: Fact[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (reduceMotion || paused) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % facts.length);
    }, INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [facts.length, paused, reduceMotion]);

  const current = facts[index];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div aria-hidden="true" className="relative h-[3.25rem] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.label}
            initial={reduceMotion ? false : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: -16, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <div className="numeral text-2xl text-foreground">{current.value}</div>
            <div className="kicker mt-1 !text-muted-dim">{current.label}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      <ul className="sr-only">
        {facts.map((fact) => (
          <li key={fact.label}>
            {fact.value} {fact.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
