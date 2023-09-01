import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ngẫu nghiên',
  description: 'Manga ngẫu nhiên Moetruyen',
  keywords: ['Ngẫu nhiên', 'Manga', 'Moetruyen'],
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const RandomManga = async () => {
  const randomManga =
    (await db.$queryRaw`SELECT "slug" FROM "Manga" WHERE "isPublished" = true ORDER BY random() LIMIT 1`) as {
      slug: string;
    }[];
  if (!randomManga.length) return redirect('/');

  return redirect(`/manga/${randomManga[0].slug}`);
};

export default RandomManga;
