import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { randomManga } from '@/lib/query';
import { cn, formatTimeToNow, groupArray } from '@/lib/utils';
import type { Session } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '../ui/Card';

const getMangas = async (session: Session | null) => {
  let manga;

  if (session) {
    const history = await db.history.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        manga: {
          select: {
            tags: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
    });

    if (!history.length) manga = await randomManga(12);
    else {
      const tags = history.flatMap((h) => h.manga.tags.map((tag) => tag.name));
      const groupedTags = (
        Object.entries(groupArray(tags)) as [string, number][]
      ).sort((a, b) => b[1] - a[1]);
      const filterdTags = groupedTags.slice(0, 3).map((tag) => tag[0]);

      manga = await db.manga.findMany({
        where: {
          isPublished: true,
          OR: filterdTags.map((tag) => ({ tags: { some: { name: tag } } })),
        },
        select: {
          id: true,
          image: true,
          name: true,
          createdAt: true,
        },
        take: 12,
      });
    }
  } else {
    manga = await randomManga(12);
  }

  return manga;
};

const Recommendation = async () => {
  const session = await getAuthSession();
  const mangas = await getMangas(session);

  return (
    <div
      className={cn(
        'flex gap-4 py-2 overflow-auto snap-proximity snap-x rounded-lg dark:bg-zinc-900/75',
        'md:grid md:place-items-center md:grid-cols-4 md:snap-y md:max-h-96 md:scrollbar md:dark:scrollbar--dark'
      )}
    >
      {mangas.map((manga, idx) => (
        <Link
          key={idx}
          href={`/manga/${manga.id}`}
          className="w-fit snap-start"
        >
          <Card className="relative overflow-hidden w-fit">
            <div className="relative w-32 h-44 lg:w-40 lg:h-56">
              <Image
                fill
                sizes="10vw"
                quality={30}
                src={manga.image}
                alt="Recommend Manga Image"
                className="object-cover rounded-lg"
              />
            </div>

            <div className="absolute inset-0 transition-opacity opacity-0 hover:opacity-100 hover:bg-gradient-to-t dark:from-zinc-900 flex items-end">
              <div className="p-2">
                <CardContent className="p-0 text-lg">{manga.name}</CardContent>
                <CardFooter className="p-0 text-sm">
                  {formatTimeToNow(new Date(manga.createdAt))}
                </CardFooter>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default Recommendation;
