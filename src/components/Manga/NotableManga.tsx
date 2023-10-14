import { db } from '@/lib/db';
import CarouselManga from './components/CarouselManga';

const NotableManga = async () => {
  const pin = await db.mangaPin.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      manga: {
        select: {
          id: true,
          slug: true,
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
      },
    },
  });

  return <CarouselManga pin={pin} />;
};

export default NotableManga;
