import { db } from '@/lib/db';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
const NotableManga = dynamic(() => import('@/components/Manga/NotableManga'), {
  ssr: false,
  loading: () => (
    <p className="flex justify-center">
      <Loader2 className="w-6 h-6 animate-spin" />
    </p>
  ),
});

const Home = async () => {
  const manga = await db.manga.findMany({
    where: {
      isPublished: true,
    },
    select: {
      id: true,
      name: true,
      image: true,
      author: {
        select: {
          name: true,
        },
      },
      tags: {
        select: {
          name: true,
          description: true,
        },
      },
    },
    take: 10,
  });

  return (
    <div className="container mx-auto max-sm:px-2 h-full pt-20">
      <NotableManga mangas={manga} />
    </div>
  );
};

export default Home;
