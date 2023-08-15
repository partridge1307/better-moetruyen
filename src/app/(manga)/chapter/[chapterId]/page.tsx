import { db } from '@/lib/db';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { FC } from 'react';
const ViewChapter = dynamic(() => import('@/components/Chapter/ViewChapter'), {
  ssr: false,
  loading: () => (
    <template className="flex justify-center items-center">
      <Loader2 className="w-10 h-10 animate-spin" />
    </template>
  ),
});

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
    description: `Đọc ${chapter.manga.name} | Moetruyen`,
    keywords: [
      'Chapter',
      'Manga',
      `${chapter.manga.name}`,
      `${chapter.chapterIndex}`,
    ],
    openGraph: {
      title: `Chap. ${chapter.chapterIndex} - ${chapter.manga.name}`,
      description: `Đọc ${chapter.manga.name} | Moetruyen`,
      images: [
        { url: `${chapter.manga.image}`, alt: `Ảnh bìa ${chapter.manga.name}` },
      ],
    },
    twitter: {
      title: `Chap. ${chapter.chapterIndex} - ${chapter.manga.name}`,
      description: `Đọc ${chapter.manga.name} | Moetruyen`,
      card: 'summary_large_image',
      images: [
        { url: `${chapter.manga.image}`, alt: `Ảnh bìa ${chapter.manga.name}` },
      ],
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
        isPublished: true,
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
