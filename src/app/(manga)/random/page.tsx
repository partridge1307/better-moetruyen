import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

const RandomManga = async () => {
  const randomManga =
    (await db.$queryRaw`SELECT "id" FROM "Manga" WHERE "isPublished" = true ORDER BY random() LIMIT 1`) as {
      id: number;
    }[];

  return redirect(`/manga/${randomManga[0].id}`);
};

export default RandomManga;
