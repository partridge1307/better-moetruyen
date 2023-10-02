'use client';

import { useFollow } from '@/hooks/use-follow';
import type { Manga } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useEffect } from 'react';

type MangaFollowType = Pick<Manga, 'id' | 'slug' | 'image' | 'name'> & {
  _count: {
    chapter: number;
    followedBy: number;
  };
};

interface MangaProps {
  initialData: {
    follows: MangaFollowType[];
    lastCursor?: number;
  };
}

const Manga: FC<MangaProps> = ({ initialData }) => {
  const {
    follows,
    entry,
    hasNextPage,
    isFetchingNextPage,
    ref,
    fetchNextPage,
  } = useFollow<MangaFollowType>(initialData, 'manga');

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, fetchNextPage, hasNextPage]);

  return (
    <>
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-2 rounded-md dark:bg-zinc-900/60">
        {follows.map((manga, idx) => {
          if (idx === follows.length - 1)
            return (
              <Link
                ref={ref}
                key={manga.id}
                href={`/manga/${manga.slug}`}
                className="grid grid-cols-[.6fr_1fr] lg:grid-cols-[.8fr_1fr] gap-6 rounded-md dark:bg-zinc-800"
              >
                <div className="relative" style={{ aspectRatio: 4 / 3 }}>
                  <Image
                    fill
                    sizes="(max-width: 640px) 25vw, 30vw"
                    quality={40}
                    src={manga.image}
                    alt={`${manga.name} Thumbnail`}
                    className="object-cover"
                  />
                </div>

                <div className="text-sm space-y-1 md:space-y-3">
                  <p className="text-lg font-semibold">{manga.name}</p>

                  <div>
                    <dl className="flex items-center gap-1.5">
                      <dt>Chapter:</dt>
                      <dd>{manga._count.chapter}</dd>
                    </dl>

                    <dl className="flex items-center gap-1.5">
                      <dt>Theo dõi:</dt>
                      <dd>{manga._count.followedBy}</dd>
                    </dl>
                  </div>
                </div>
              </Link>
            );
          else
            return (
              <Link
                key={manga.id}
                href={`/manga/${manga.slug}`}
                className="grid grid-cols-[.6fr_1fr] lg:grid-cols-[.8fr_1fr] gap-6 rounded-md dark:bg-zinc-800"
              >
                <div className="relative" style={{ aspectRatio: 4 / 3 }}>
                  <Image
                    fill
                    sizes="(max-width: 640px) 25vw, 30vw"
                    quality={40}
                    src={manga.image}
                    alt={`${manga.name} Thumbnail`}
                    className="object-cover"
                  />
                </div>

                <div className="text-sm space-y-1 md:space-y-3">
                  <p className="text-lg font-semibold">{manga.name}</p>

                  <div>
                    <dl className="flex items-center gap-1.5">
                      <dt>Chapter:</dt>
                      <dd>{manga._count.chapter}</dd>
                    </dl>

                    <dl className="flex items-center gap-1.5">
                      <dt>Theo dõi:</dt>
                      <dd>{manga._count.followedBy}</dd>
                    </dl>
                  </div>
                </div>
              </Link>
            );
        })}
      </section>

      {isFetchingNextPage && (
        <p className="flex justify-center">
          <Loader2 className="w-10 h-10 animate-spin" />
        </p>
      )}
    </>
  );
};

export default Manga;
