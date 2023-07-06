import NotableManga from "@/components/Manga/NotableManga";
import { db } from "@/lib/db";

const Home = async () => {
  const manga = await db.manga.findMany({
    where: {
      isPublished: true,
    },
    include: {
      tags: true,
      author: true,
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
