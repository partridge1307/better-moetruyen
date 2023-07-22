import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
const NotableManga = dynamic(() => import('@/components/Manga/NotableManga'), {
  ssr: false,
});

const Home = async () => {
  const manga = await db.manga.findMany({
    where: {
      isPublished: true,
    },
    select: {
      tags: true,
      author: true,
      id: true,
      name: true,
      image: true,
    },
    take: 10,
  });

  return (
    <div className="container mx-auto h-full pt-20">
      <div className="relative h-72 w-full">
        <NotableManga manga={manga} className="relative h-96" />
      </div>
    </div>
  );
};

export default Home;
