import type { ReactNode } from "react";
import clsx from "clsx";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("container-page", className)}>{children}</div>;
}

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={clsx("relative py-20 md:py-28", className)}>
      {children}
    </section>
  );
}

export function Kicker({ children, index }: { children: ReactNode; index?: string }) {
  return (
    <div className="flex items-center gap-3">
      {index && <span className="kicker">{index}</span>}
      <span className="h-px w-8 bg-border-strong" aria-hidden="true" />
      <span className="kicker">{children}</span>
    </div>
  );
}
