'use client';

import '@/styles/zoom.css';
import type { Manga } from '@prisma/client';
import Image from 'next/image';
import type { FC } from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface MangaCardProps extends React.HTMLAttributes<HTMLImageElement> {
  manga: Pick<Manga, 'name' | 'image'>;
}

const MangaImage: FC<MangaCardProps> = ({ manga }) => {
  return (
    <Zoom classDialog="custom-zoom">
      <div className="relative" style={{ aspectRatio: 4 / 3 }}>
        <Image
          fill
          sizes="(max-width: 640px) 100vw, 70vw"
          quality={40}
          priority
          src={manga.image}
          alt={`${manga.name} Thumbnail`}
          className="object-cover rounded-md"
        />
      </div>
    </Zoom>
  );
};

export default MangaImage;
