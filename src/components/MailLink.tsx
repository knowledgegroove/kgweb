"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

/**
 * A mailto: link that also copies the address to the clipboard on click.
 * Some browsers/OSes have no mail client registered as the default
 * handler for mailto:, in which case the link silently does nothing —
 * this guarantees the visitor still walks away with the address.
 */
export function MailLink({
  email,
  href,
  className,
  children,
}: {
  email: string;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard API unavailable or blocked; the mailto: link still
      // attempts to open normally regardless.
    }
  }

  return (
    <a href={href} onClick={handleClick} className={clsx("relative", className)}>
      {children}
      <AnimatePresence>
        {copied && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute -top-8 left-0 z-10 whitespace-nowrap rounded-full bg-foreground px-2.5 py-1 text-[10px] font-medium text-background"
          >
            Copied to clipboard
          </motion.span>
        )}
      </AnimatePresence>
    </a>
  );
}
