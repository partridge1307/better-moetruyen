import { cn } from '@/lib/utils';
import type { Manga } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';

interface MangaImageProps extends React.HTMLAttributes<HTMLImageElement> {
  manga: Pick<Manga, 'image'>;
  sizes?: string;
  priority?: boolean;
}

const MangaImage: FC<MangaImageProps> = ({
  manga,
  sizes = '30vw',
  priority = false,
  className,
  placeholder,
  ...props
}) => {
  return (
    <div className="relative" style={{ aspectRatio: 5 / 7 }}>
      <Image
        fill
        sizes={sizes}
        priority={priority}
        quality={40}
        src={manga.image}
        alt={`Ảnh bìa ${manga.image}`}
        className={cn('object-cover rounded-md', className)}
        {...props}
      />
    </div>
  );
};

export default MangaImage;
