import ViewChapter from '@/components/Chapter/ViewChapter';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { chapterId: string };
}): Promise<Metadata> {
  const chapter = await db.chapter.findFirst({
    where: {
      id: +params.chapterId,
      isPublished: true,
      manga: {
        isPublished: true,
      },
    },
    select: {
      manga: {
        select: {
          image: true,
          name: true,
          review: true,
        },
      },
      chapterIndex: true,
    },
  });

  if (!chapter)
    return {
      title: 'Chapter',
      openGraph: {
        title: 'Chapter | Moetruyen',
        description: 'Chapter | Moetruyen',
      },
    };

  return {
    title: `Chap. ${chapter.chapterIndex} - ${chapter.manga.name}`,
    description: `${chapter.manga.review} | Moetruyen`,
    keywords: [
      'Chapter',
      'Manga',
      `${chapter.manga.name}`,
      `${chapter.chapterIndex}`,
    ],
    openGraph: {
      title: `Chap. ${chapter.chapterIndex} - ${chapter.manga.name}`,
      description: `${chapter.manga.review} | Moetruyen`,
    },
    twitter: {
      title: `Chap. ${chapter.chapterIndex} - ${chapter.manga.name}`,
      description: `${chapter.manga.review} | Moetruyen`,
    },
  };
}

interface pageProps {
  params: {
    chapterId: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const chapter = await db.chapter.findFirst({
    where: {
      id: +params.chapterId,
      isPublished: true,
      manga: {
        isPublished: true,
      },
    },
    select: {
      manga: {
        select: {
          name: true,
          id: true,
          isPublished: true,
        },
      },
      images: true,
      id: true,
      name: true,
      chapterIndex: true,
      volume: true,
    },
  });
  if (!chapter) return notFound();

  const chapterList = await db.manga
    .findUnique({
      where: {
        id: chapter.manga.id,
      },
    })
    .chapter({
      select: {
        id: true,
        chapterIndex: true,
        name: true,
        volume: true,
        isPublished: true,
      },
    });

  return (
    <div className="mt-8 h-full">
      <ViewChapter chapter={chapter} chapterList={chapterList} />
    </div>
  );
};

export default page;
