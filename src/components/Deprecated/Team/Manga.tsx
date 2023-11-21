import { db } from '@/lib/db';
import type { Team } from '@prisma/client';
import { FC } from 'react';
import { TabsContent } from '../ui/Tabs';
import Link from 'next/link';
import Image from 'next/image';

interface MangaProps {
  team: Pick<Team, 'id'>;
}

const Manga: FC<MangaProps> = async ({ team }) => {
  const chapters = await db.chapter.findMany({
    where: {
      teamId: team.id,
      isPublished: true,
    },
    distinct: ['mangaId'],
    select: {
      manga: {
        select: {
          id: true,
          slug: true,
          name: true,
          image: true,
          isPublished: true,
          _count: {
            select: {
              chapter: {
                where: {
                  isPublished: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return (
    <TabsContent
      value="manga"
      className="data-[state=inactive]:hidden grid grid-cols-2 lg:grid-cols-3 gap-4 p-2 rounded-md dark:bg-zinc-900/60"
    >
      {chapters.map(({ manga }) => {
        if (manga.isPublished)
          return (
            <Link
              key={manga.id}
              href={`/manga/${manga.slug}`}
              className="grid grid-cols-[.5fr_1fr] gap-4 rounded-md transition-colors bg-background hover:dark:bg-background/60"
            >
              <div className="relative" style={{ aspectRatio: 4 / 3 }}>
                <Image
                  fill
                  sizes="(max-width: 640px) 20vw, 25vw"
                  quality={40}
                  src={manga.image}
                  alt={`${manga.name} Thumbnail`}
                  className="object-cover"
                />
              </div>

              <div className="space-y-2">
                <h1 className="text-lg font-semibold">{manga.name}</h1>
                <dl className="text-sm flex items-center gap-1.5">
                  <dt>Chapter:</dt>
                  <dd>{manga._count.chapter}</dd>
                </dl>
              </div>
            </Link>
          );
      })}
    </TabsContent>
  );
};

export default Manga;
