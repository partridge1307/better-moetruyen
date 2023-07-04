'use client';

import { Maximize2 } from 'lucide-react';
import Image from 'next/image';
import { FC, useCallback, useState } from 'react';
import { Controlled as Zoom } from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

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
      <div className="relative w-24 h-32 md:w-44 md:h-56">
        <Image fill src={image} alt="Manga Image" className={className} />
        <div
          className="absolute h-full w-full rounded-md flex items-center justify-center opacity-0 cursor-zoom-in hover:opacity-100 hover:bg-black/50"
          onClick={() => setIsZoomed(true)}
        >
          <Maximize2 className="h-1/2 w-1/2" />
        </div>
      </div>
    </Zoom>
  );
};

export default MangaImage;
