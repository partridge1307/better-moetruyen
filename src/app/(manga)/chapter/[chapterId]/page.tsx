import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const ViewChapter = dynamic(() => import('@/components/Chapter/ViewChapter'), {
  ssr: false,
  loading: () => (
    <div className="container px-3 h-full mt-8 space-y-16">
      <div className="w-full h-24 rounded-md animate-pulse dark:bg-zinc-900" />
      <div className="w-full h-full rounded-md animate-pulse dark:bg-zinc-900" />
    </div>
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
    title: {
      default: `Chap. ${chapter.chapterIndex} - ${chapter.manga.name}`,
      absolute: `Chap. ${chapter.chapterIndex} - ${chapter.manga.name}`,
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
      title: `Chap. ${chapter.chapterIndex} - ${chapter.manga.name}`,
      description: `Đọc ${chapter.manga.name} | Moetruyen`,
      images: [
        { url: `${chapter.manga.image}`, alt: `Ảnh bìa ${chapter.manga.name}` },
      ],
    },
    twitter: {
      site: 'Moetruyen',
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
        images: true,
        id: true,
        name: true,
        chapterIndex: true,
        volume: true,
      },
    }),
    getAuthSession(),
  ]);
  if (!chapter) return notFound();

  let chapterList;
  if (session) {
    [chapterList] = await db.$transaction([
      db.manga
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
    chapterList = await db.manga
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
  }

  return (
    <div className="mt-8 h-full">
      <ViewChapter chapter={chapter} chapterList={chapterList} />
    </div>
  );
};

export default page;
