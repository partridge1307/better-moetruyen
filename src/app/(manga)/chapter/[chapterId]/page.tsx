import ViewChapterSkeleton from '@/components/Skeleton/ViewChapterSkeleton';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getImagesBase64 } from '@/lib/plaiceholder';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const ViewChapter = dynamic(() => import('@/components/Chapter/ViewChapter'), {
  ssr: false,
  loading: () => <ViewChapterSkeleton />,
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
    title: {
      default: `Chapter ${chapter.chapterIndex} - ${chapter.manga.name}`,
      absolute: `Chapter ${chapter.chapterIndex} - ${chapter.manga.name}`,
    },
    description: `Đọc ${chapter.manga.name} | Moetruyen`,
    keywords: [
      'Chapter',
      'Manga',
      `${chapter.manga.name}`,
      `${chapter.chapterIndex}`,
    ],
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/chapter/${params.chapterId}`,
    },
    openGraph: {
      url: `${process.env.NEXTAUTH_URL}/chapter/${params.chapterId}`,
      siteName: 'Moetruyen',
      title: `Chapter ${chapter.chapterIndex} - ${chapter.manga.name}`,
      description: `Đọc ${chapter.manga.name} | Moetruyen`,
      images: [
        { url: `${chapter.manga.image}`, alt: `Ảnh bìa ${chapter.manga.name}` },
      ],
    },
    twitter: {
      site: 'Moetruyen',
      title: `Chapter ${chapter.chapterIndex} - ${chapter.manga.name}`,
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
    chapterId: string | string[];
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const [chapter, session] = await Promise.all([
    db.chapter.findFirst({
      where: {
        id: +params.chapterId,
        isPublished: true,
      },
      select: {
        manga: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        id: true,
        volume: true,
        chapterIndex: true,
        name: true,
        images: true,
      },
    }),
    getAuthSession(),
  ]);
  if (!chapter) return notFound();

  let chapterList, imagesWithBlur;
  if (session) {
    [imagesWithBlur, chapterList] = await Promise.all([
      getImagesBase64(chapter.images),
      db.chapter.findMany({
        where: {
          mangaId: chapter.manga.id,
          isPublished: true,
        },
        select: {
          id: true,
          volume: true,
          chapterIndex: true,
          name: true,
        },
        orderBy: {
          chapterIndex: 'asc',
        },
      }),
      db.history.update({
        where: {
          userId_mangaId: {
            userId: session.user.id,
            mangaId: chapter.manga.id,
          },
        },
        data: {
          chapterId: chapter.id,
        },
      }),
    ]);
  } else {
    [imagesWithBlur, chapterList] = await Promise.all([
      getImagesBase64(chapter.images),
      db.chapter.findMany({
        where: {
          mangaId: chapter.manga.id,
          isPublished: true,
        },
        select: {
          id: true,
          volume: true,
          chapterIndex: true,
          name: true,
        },
        orderBy: {
          chapterIndex: 'asc',
        },
      }),
    ]);
  }

  return (
    <main className="container px-1 mt-10 space-y-10">
      <ViewChapter
        chapter={chapter}
        imagesWithBlur={imagesWithBlur}
        chapterList={chapterList}
      />
    </main>
  );
};

export default page;
