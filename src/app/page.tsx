import NotableManga from '@/components/Manga/NotableManga';
import { db } from '@/lib/db';

const Home = async () => {
  const manga = await db.manga.findMany({
    include: {
      tags: true,
      author: true,
    },
    take: 10,
  });

  return (
    <div className="container h-full mx-auto pt-20">
      <div className="relative w-full h-72">
        <NotableManga manga={manga} className="relative h-96" />
      </div>
    </div>
  );
};

export default Home;
