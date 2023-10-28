import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Chapter } from '@prisma/client';
import dynamic from 'next/dynamic';
import type { FC } from 'react';
import type { Metadata } from 'next';

const Reader = dynamic(() => import('@/components/Chapter/Reader'), {
  ssr: false,
});

interface pageProps {
  params: {
    id: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const [session, chapter] = await Promise.all([
    getAuthSession(),
    db.chapter.findUnique({
      where: {
        id: +params.id,
        isPublished: true,
      },
      select: {
        id: true,
        volume: true,
        chapterIndex: true,
        name: true,
        images: true,
        manga: {
          select: {
            id: true,
            slug: true,
            chapter: {
              where: {
                isPublished: true,
              },
              orderBy: {
                chapterIndex: 'desc',
              },
              select: {
                id: true,
                volume: true,
                chapterIndex: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);
  if (!chapter) return;

  if (session) {
    await db.history.upsert({
      where: {
        userId_mangaId: {
          userId: session.user.id,
          mangaId: chapter.manga.id,
        },
      },
      update: {
        createdAt: new Date(),
      },
      create: {
        userId: session.user.id,
        mangaId: chapter.manga.id,
      },
    });
  }

  const navChapter = getNavChapter(chapter.id, chapter.manga.chapter);

  return (
    <main className="relative h-[100dvh] bg-background">
      <Reader
        currentChapterId={chapter.id}
        mangaSlug={chapter.manga.slug}
        images={chapter.images}
        title={`Vol. ${chapter.volume} Ch. ${chapter.chapterIndex}${
          !!chapter.name && ` - ${chapter.name}`
        }`}
        prevChapter={!!navChapter?.prev ? navChapter.prev : null}
        nextChapter={!!navChapter?.next ? navChapter.next : null}
        chapterList={chapter.manga.chapter}
      />
    </main>
  );
};

export default page;

const getNavChapter = (
  currentId: number,
  chaptersList: Pick<Chapter, 'id' | 'volume' | 'chapterIndex' | 'name'>[]
) => {
  const index = chaptersList.findIndex((chapter) => chapter.id === currentId);
  if (index === -1) return null;

  return {
    prev: index === 0 ? null : chaptersList[index - 1],
    next: index === chaptersList.length - 1 ? null : chaptersList[index + 1],
  };
};

export async function generateMetadata({
  params,
}: pageProps): Promise<Metadata> {
  const chapter = await db.chapter.findUnique({
    where: {
      id: +params.id,
      isPublished: true,
    },
    select: {
      volume: true,
      chapterIndex: true,
      name: true,
      manga: {
        select: {
          image: true,
          name: true,
        },
      },
    },
  });

  if (!chapter)
    return {
      title: `Đọc truyện ${params.id}`,
    };

  const title = `Vol. ${chapter.volume} Ch. ${chapter.chapterIndex}${
    !!chapter.name && ` - ${chapter.name}`
  }. Truyện ${chapter.manga.name} | Tiếp Chap ${chapter.chapterIndex + 1}`;
  const description = `Đọc truyện ${chapter.manga.name} Chap ${chapter.chapterIndex}.`;

  return {
    title: {
      absolute: title,
      default: title,
    },
    description,
    keywords: [
      'Chapter',
      'Manga',
      'Truyện tranh',
      'Moetruyen',
      chapter.manga.name,
    ],
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/chapter/${params.id}`,
    },
    openGraph: {
      url: `${process.env.NEXTAUTH_URL}/chapter/${params.id}`,
      siteName: 'Moetruyen',
      title,
      description,
      locale: 'vi_VN',
      images: [
        {
          url: chapter.manga.image,
          alt: `Ảnh bìa ${chapter.manga.name}`,
        },
      ],
    },
    twitter: {
      site: 'Moetruyen',
      title,
      description,
      card: 'summary_large_image',
      images: [
        {
          url: chapter.manga.image,
          alt: `Ảnh bìa ${chapter.manga.image}`,
        },
      ],
    },
  };
}
