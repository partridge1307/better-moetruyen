import { db } from '@/lib/db';
import CarouselManga from './components/CarouselManga';

const NotableManga = async () => {
  const pin = await db.mangaPin.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
    select: {
      manga: {
        select: {
          id: true,
          slug: true,
          name: true,
          image: true,
          review: true,
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: pin.map(({ manga }, idx) => ({
      '@type': 'ListItem',
      position: idx,
      url: `${process.env.NEXTAUTH_URL}/manga/${manga.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <CarouselManga pin={pin} />
    </>
  );
};

export default NotableManga;
