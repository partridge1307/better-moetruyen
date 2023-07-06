"use client";

import { Maximize2 } from "lucide-react";
import Image from "next/image";
import { FC, useCallback, useState } from "react";
import { Controlled as Zoom } from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

interface MangaCardProps extends React.HTMLAttributes<HTMLImageElement> {
  image: string;
}

const MangaImage: FC<MangaCardProps> = ({ image, className }) => {
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const handleZoom = useCallback((value: boolean) => {
    setIsZoomed(value);
  }, []);

  return (
    <Zoom
      isZoomed={isZoomed}
      onZoomChange={handleZoom}
      classDialog="custom-zoom"
    >
      <div className="relative h-32 w-24 md:h-56 md:w-44">
        <Image
          fill
          sizes="0%"
          priority
          src={image}
          alt="Manga Image"
          className={className}
        />
        <div
          className="absolute flex h-full w-full cursor-zoom-in items-center justify-center rounded-md opacity-0 hover:bg-black/50 hover:opacity-100"
          onClick={() => setIsZoomed(true)}
        >
          <Maximize2 className="h-1/2 w-1/2" />
        </div>
      </div>
    </Zoom>
  );
};

export default MangaImage;
