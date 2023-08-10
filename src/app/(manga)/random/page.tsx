import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const RandomManga = async () => {
  const randomManga =
    (await db.$queryRaw`SELECT "id" FROM "Manga" WHERE "isPublished" = true ORDER BY random() LIMIT 1`) as {
      id: number;
    }[];
  if (!randomManga.length) return redirect('/');

  return redirect(`/manga/${randomManga[0].id}`);
};

export default RandomManga;
