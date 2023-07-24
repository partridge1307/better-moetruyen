import { cn, groupBy } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface TeamMangaListProps {
  chapter: {
    id: number;
    name?: string | null;
    chapterIndex: number;
    volume: number;
    createdAt: Date;
    manga: {
      id: number;
      name: string;
      image: string;
    };
  }[];
}

const TeamMangaList: FC<TeamMangaListProps> = ({ chapter }) => {
  return (
    <div className="flex flex-wrap max-sm:justify-center gap-4 mt-4">
      {chapter &&
        Object.entries(
          groupBy(
            chapter.flatMap((c) => ({
              id: c.manga.id,
              name: c.manga.name,
              image: c.manga.image,
            })),
            (c) => c.name
          )
        ).map(([K, V]) => (
          <Link key={K} href={`/manga/${V[0].id}`} className="relative w-fit">
            <div
              className={cn(
                'absolute z-10 inset-0 flex items-end justify-center',
                'bg-gradient-to-t dark:from-zinc-900',
                'md:opacity-0 md:hover:opacity-100 transition-opacity'
              )}
            >
              <p className="pb-6 text-lg text-center font-semibold">
                {V[0].name}
              </p>
            </div>
            <div className="relative w-52 h-64">
              <Image
                fill
                priority
                sizes="0%"
                src={V[0].image}
                alt="Manga Image"
                className="object-cover rounded-md"
              />
            </div>
          </Link>
        ))}
    </div>
  );
};

export default TeamMangaList;
