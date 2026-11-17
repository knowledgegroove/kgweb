"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import type { PortalData } from "./types";

const POLL_MS = 4000;

interface PortalContextValue {
  data: PortalData | null;
  /** "reauth" = signed in with an old session that needs a fresh sign-in. */
  error: "reauth" | "network" | null;
  refresh: () => Promise<void>;
}

const PortalContext = createContext<PortalContextValue>({ data: null, error: null, refresh: async () => {} });

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState<PortalContextValue["error"]>(null);
  const inflight = useRef(false);

  const refresh = useCallback(async () => {
    if (inflight.current) return;
    inflight.current = true;
    try {
      const res = await fetch("/ALportal/api/data", { cache: "no-store" });
      if (res.status === 401) {
        setError("reauth");
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      setData((await res.json()) as PortalData);
      setError(null);
    } catch {
      setError((e) => e ?? "network");
    } finally {
      inflight.current = false;
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    const tick = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    tick();
    const id = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [status, refresh]);

  const value = status === "authenticated" ? { data, error, refresh } : { data: null, error: null, refresh };
  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  return useContext(PortalContext);
}
