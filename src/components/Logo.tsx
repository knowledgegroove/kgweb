import Link from "next/link";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="21.5" stroke="#1C1810" strokeWidth="1.4" />
      <circle cx="24" cy="24" r="15.5" stroke="#1C1810" strokeWidth="1" opacity="0.55" />
      <circle cx="24" cy="24" r="9.5" stroke="#1C1810" strokeWidth="1" opacity="0.32" />
      <circle cx="24" cy="24" r="4.5" fill="#B5482A" />
      <circle cx="24" cy="24" r="1.4" fill="#F7F2E7" />
    </svg>
  );
}

export function Logo({ withWordmark = true, size = 34 }: { withWordmark?: boolean; size?: number }) {
  return (
    <Link
      href="/"
      className="focus-ring inline-flex items-center gap-3"
      aria-label="Knowledge Groove home"
    >
      <LogoMark size={size} />
      {withWordmark && (
        <span className="font-display text-xl leading-none tracking-tight text-foreground">
          Knowledge <em className="font-medium italic text-accent">Groove</em>
        </span>
      )}
    </Link>
  );
}
