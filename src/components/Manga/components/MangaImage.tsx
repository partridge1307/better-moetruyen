'use client';

import { AspectRatio } from '@/components/ui/AspectRatio';
import '@/styles/zoom.css';
import type { Manga } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface MangaCardProps extends React.HTMLAttributes<HTMLImageElement> {
  manga: Pick<Manga, 'name' | 'image'>;
}

const MangaImage: FC<MangaCardProps> = ({ manga }) => {
  return (
    <Zoom classDialog="custom-zoom">
      <AspectRatio ratio={4 / 3}>
        <Image
          fill
          sizes="(max-width: 640px) 100vw, 70vw"
          quality={40}
          priority
          src={manga.image}
          alt={`${manga.name} Thumbnail`}
          className="object-cover rounded-md"
        />
      </AspectRatio>
    </Zoom>
  );
};

export default MangaImage;
