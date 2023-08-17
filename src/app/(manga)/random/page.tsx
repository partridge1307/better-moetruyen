import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ngẫu nghiên',
  description: 'Manga ngẫu nhiên Moetruyen',
  keywords: ['Ngẫu nhiên', 'Manga', 'Moetruyen'],
  openGraph: {
    siteName: 'Moetruyen',
    title: 'Ngẫu nhiên',
    description: 'Ngẫu nhiên | Moetruyen',
  },
  twitter: {
    site: 'Moetruyen',
    title: 'Ngẫu nhiên',
    description: 'Ngẫu nhiên | Moetruyen',
  },
};

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
