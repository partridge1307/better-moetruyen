import { FC } from 'react';
import { Card, CardHeader } from './ui/Card';
import { Manga } from '@prisma/client';
import Image from 'next/image';

interface MangaCardProps {
  manga: Manga;
}

const MangaCard: FC<MangaCardProps> = ({ manga }) => {
  return (
    <Card>
      <CardHeader>
        <div className="relative h-32 w-24">
          <Image fill src={manga.image} alt="Manga Image Card" />
        </div>
      </CardHeader>
    </Card>
  );
};

export default MangaCard;
