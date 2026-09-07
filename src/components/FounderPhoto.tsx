import Image from "next/image";
import clsx from "clsx";

export function FounderPhoto({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "relative aspect-[4/5] w-full overflow-hidden border border-border-strong bg-surface",
        className
      )}
    >
      <Image
        src="/images/ishaan-headshot.jpg"
        alt="Ishaan Garg, founder of Knowledge Groove"
        fill
        sizes="(min-width: 768px) 24rem, 90vw"
        className="object-cover"
        priority
      />
    </div>
  );
}
