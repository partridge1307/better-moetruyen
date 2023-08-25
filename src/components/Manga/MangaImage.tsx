'use client';

import { cn, rgbDataURL } from '@/lib/utils';
import '@/styles/zoom.css';
import type { Manga } from '@prisma/client';
import { Maximize2 } from 'lucide-react';
import Image from 'next/image';
import { FC, useCallback, useState } from 'react';
import { Controlled as Zoom } from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface MangaCardProps extends React.HTMLAttributes<HTMLImageElement> {
  manga: Pick<Manga, 'id' | 'image'>;
  className: string;
}

const MangaImage: FC<MangaCardProps> = ({ manga, className }) => {
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
      <div className={cn('relative', className)}>
        <Image
          fill
          sizes="40vw"
          priority
          src={manga.image}
          placeholder="blur"
          blurDataURL={rgbDataURL(255, 209, 148)}
          alt="Manga Image"
          className="rounded-md object-cover"
        />
        <div
          role="button"
          className="absolute flex inset-0 cursor-zoom-in items-center justify-center rounded-md opacity-0 hover:bg-black/50 hover:opacity-100"
          onClick={() => setIsZoomed(true)}
        >
          <Maximize2 className="h-1/2 w-1/2" />
        </div>
      </div>
    </Zoom>
  );
};

export default MangaImage;
