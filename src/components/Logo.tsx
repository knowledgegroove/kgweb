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
      <path
        d="M5 30C9 16 14 15 18 25C22 35 27 35 31 23C33.5 15.5 37 13.5 40 15"
        stroke="#1A1712"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="40" cy="15" r="3.4" fill="#A8431F" />
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
