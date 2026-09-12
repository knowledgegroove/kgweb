"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Camera } from "@phosphor-icons/react/dist/ssr";
import { GlowCard } from "./ui/spotlight-card";
import type { GalleryPhoto } from "@/lib/data";

export function GalleryTile({
  photo,
  onOpen,
}: {
  photo: GalleryPhoto;
  onOpen: () => void;
}) {
  const [broken, setBroken] = useState(false);
  const patternId = `hatch-${useId()}`;

  return (
    <GlowCard
      customSize
      className="group aspect-[4/5] w-full overflow-hidden"
    >
      {broken ? (
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 bg-background-alt p-4 text-center">
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full opacity-[0.35]"
            preserveAspectRatio="none"
          >
            <pattern id={patternId} width="14" height="14" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="14" stroke="#C5B285" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill={`url(#${patternId})`} />
          </svg>
          <Camera size={22} weight="light" className="relative text-muted-dim" />
          <span className="relative kicker !text-muted-dim">Photo coming soon</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`View photo: ${photo.caption}`}
          className="focus-ring relative block h-full w-full cursor-pointer"
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
            onError={() => setBroken(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141110]/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="absolute inset-x-0 bottom-0 translate-y-2 p-4 text-sm text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {photo.caption}
          </span>
        </button>
      )}
    </GlowCard>
  );
}
