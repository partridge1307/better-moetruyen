import { Manga } from '@prisma/client';
import { FC } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/Card';
import Image from 'next/image';
import { formatTimeToNow } from '@/lib/utils';
import Link from 'next/link';

interface MangaUploadCardProps {
  manga: Manga;
}

const MangaUploadCard: FC<MangaUploadCardProps> = ({ manga }) => {
  return (
    <Link href={`/me/manga/${manga.id}/chapter`}>
      <Card className="bg-zinc-800 text-slate-50">
        <CardHeader className="grid grid-cols-1 lg:grid-cols-[.3fr_1fr] gap-x-3 max-md:h-fit lg:h-40">
          <div className="relative w-full lg:h-full h-24">
            <Image
              fill
              src={manga.image}
              alt="Manga Picture"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="space-y-2">
            <CardTitle>{manga.name}</CardTitle>
            <CardDescription className="text-slate-50">
              {manga.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex gap-x-2">
          <div>Tác giả:</div>
          <p>{manga.author}</p>
        </CardContent>
        <CardFooter className="grid grid-cols-1 max-md:gap-y-1 lg:grid-cols-2">
          <div className="flex gap-x-1">
            <div>Upload lúc:</div>
            <p>{formatTimeToNow(manga.createdAt)}</p>
          </div>
          <div className="flex gap-x-1">
            <div>Cập nhật lúc:</div>
            <p className="tracking-tighter">
              {formatTimeToNow(manga.updatedAt)}
            </p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default MangaUploadCard;
