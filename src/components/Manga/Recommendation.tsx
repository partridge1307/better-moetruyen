import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { randomManga } from '@/lib/query';
import { groupArray } from '@/lib/utils';
import type { Session } from 'next-auth';
import CarouselRecommendation from './components/CarouselRecommendation';

const getMangas = async (session: Session | null) => {
  if (!session) return await randomManga(10);

  const [mangaHistory, mangaCount] = await db.$transaction([
    db.history.findMany({
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
    }),
    db.manga.count({ where: { isPublished: true } }),
  ]);

  if (!mangaHistory.length) return await randomManga(10);

  const tags = mangaHistory.flatMap((h) => h.manga.tags.map((tag) => tag.name));

  const groupedTags = (
    Object.entries(groupArray(tags)) as [string, number][]
  ).sort((a, b) => b[1] - a[1]);

  const filterdTags = groupedTags.slice(0, 3).map((tag) => tag[0]);

  const skip = Math.max(0, Math.floor(Math.random() * mangaCount) - 10);

  return await db.manga.findMany({
    where: {
      isPublished: true,
      OR: filterdTags.map((tag) => ({ tags: { some: { name: tag } } })),
    },
    select: {
      id: true,
      slug: true,
      image: true,
      name: true,
    },
    take: 10,
    skip,
  });
};

const Recommendation = async () => {
  const session = await getAuthSession();
  const mangas = await getMangas(session);

  return !!mangas.length && <CarouselRecommendation mangas={mangas} />;
};

export default Recommendation;
