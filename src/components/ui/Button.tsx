import Link from "next/link";
import clsx from "clsx";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "text";

const baseClasses =
  "focus-ring inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 ease-out";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-foreground text-background px-6 py-3.5 hover:bg-accent-deep",
  secondary:
    "border border-foreground/70 text-foreground px-6 py-3.5 hover:border-foreground hover:bg-foreground hover:text-background",
  text: "text-foreground link-underline",
};

export function Button({
  children,
  href,
  variant = "primary",
  className,
  external,
}: {
  children: ReactNode;
  href: string;
  variant?: Variant;
  className?: string;
  external?: boolean;
}) {
  const classes = clsx(baseClasses, variantClasses[variant], className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
