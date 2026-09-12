"use client";

import { useCallback, useState } from "react";
import { GalleryTile } from "./GalleryTile";
import { GalleryLightbox } from "./GalleryLightbox";
import type { GalleryPhoto } from "@/lib/data";

export function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  const [index, setIndex] = useState<number | null>(null);

  const navigate = useCallback(
    (delta: number) => {
      setIndex((i) => (i === null ? null : (i + delta + photos.length) % photos.length));
    },
    [photos.length]
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
        {photos.map((photo, i) => (
          <GalleryTile key={photo.src} photo={photo} onOpen={() => setIndex(i)} />
        ))}
      </div>
      <GalleryLightbox photos={photos} index={index} onClose={() => setIndex(null)} onNavigate={navigate} />
    </>
  );
}
