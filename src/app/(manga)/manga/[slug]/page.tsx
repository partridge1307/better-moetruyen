import MangaDesc from '@/components/Manga/components/MangaDesc';
import MangaImage from '@/components/Manga/components/MangaImage';
import MangaTabsSkeleton from '@/components/Skeleton/MangaTabsSkeleton';
import { TagContent, TagWrapper } from '@/components/ui/Tag';
import { db } from '@/lib/db';
import type { Manga } from '@prisma/client';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const MangaControll = dynamic(
  () => import('@/components/Manga/MangaControll'),
  {
    loading: () => (
      <div className="w-full h-10 rounded-md animate-pulse bg-background" />
    ),
  }
);
const MangaTabs = dynamic(() => import('@/components/Manga/MangaTabs'), {
  loading: () => <MangaTabsSkeleton />,
});

interface pageProps {
  params: {
    slug: string;
  };
}

function generateJsonLd(manga: Pick<Manga, 'name' | 'image'>, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: `${process.env.NEXTAUTH_URL}/manga/${slug}`,
    headline: `${manga.name}`,
    description: `Đọc ${manga.name} | Moetruyen`,
    image: {
      '@type': 'ImageObject',
      url: `${manga.image}`,
      width: 1280,
      height: 960,
    },
  };
}

export async function generateMetadata({
  params,
}: pageProps): Promise<Metadata> {
  const manga = await db.manga.findFirst({
    where: {
      slug: params.slug,
    },
    select: {
      slug: true,
      name: true,
      altName: true,
      image: true,
      chapter: {
        take: 1,
        orderBy: {
          chapterIndex: 'desc',
        },
        select: {
          chapterIndex: true,
        },
      },
    },
  });
  if (!manga)
    return {
      title: `Manga ${params.slug}`,
      description: `Đọc Manga ${params.slug} | Moetruyen`,
      alternates: {
        canonical: `${process.env.NEXTAUTH_URL}/manga/${params.slug}`,
      },
    };

  const title = `${manga.name} [Tới chap ${manga.chapter[0]?.chapterIndex}]`;
  const description = !!manga.altName.length
    ? `Đọc truyện ${manga.name}, ${manga.altName.join(', ')} | Moetruyen`
    : `Đọc truyện ${manga.name} | Moetruyen`;

  return {
    title: {
      default: title,
      absolute: title,
    },
    description,
    keywords: [`Manga`, `${manga.name}`, 'Moetruyen', ...manga.altName],
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/manga/${manga.slug}`,
    },
    openGraph: {
      url: `${process.env.NEXTAUTH_URL}/manga/${manga.slug}`,
      siteName: 'Moetruyen',
      title,
      description,
      locale: 'vi_VN',
      images: [
        {
          url: manga.image,
          alt: `Ảnh bìa ${manga.name}`,
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
          url: manga.image,
          alt: `Ảnh bìa ${manga.name}`,
        },
      ],
    },
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const manga = await db.manga.findUnique({
    where: {
      slug: params.slug,
      isPublished: true,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      altName: true,
      image: true,
      description: true,
      creatorId: true,
      tags: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      author: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          followedBy: true,
        },
      },
      view: {
        select: {
          totalView: true,
        },
      },
    },
  });
  if (!manga) return notFound();

  const jsonLd = generateJsonLd(manga, params.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container max-sm:px-2 mx-auto space-y-10 mb-10">
        <section className="relative grid grid-cols-2 lg:grid-cols-[.3fr_1fr] gap-3 lg:gap-6 p-2">
          <MangaImage manga={manga} />

          <div className="space-y-2">
            <h1 className="text-lg lg:text-2xl font-semibold">{manga.name}</h1>
            <p>{manga.author.map((author) => author.name).join(', ')}</p>
          </div>

          <Image
            fill
            sizes="7vw"
            quality={10}
            priority
            src={manga.image}
            alt={`${manga.name} Thumbnail`}
            className="-z-10 object-cover rounded-md brightness-[.3] blur-sm"
          />
        </section>

        <section className="p-2 pb-10 space-y-10 rounded-md dark:bg-zinc-900/60">
          <MangaControll manga={manga} />

          {!!manga.altName.length && (
            <dl className="space-y-2">
              <dt className="text-lg lg:text-xl font-semibold">Tên khác</dt>
              <dd>{manga.altName.join(', ')}</dd>
            </dl>
          )}

          <div className="space-y-2">
            <p className="text-lg lg:text-xl font-semibold">Thể loại</p>
            <TagWrapper>
              {manga.tags.map((tag) => (
                <TagContent key={tag.id} title={tag.description}>
                  {tag.name}
                </TagContent>
              ))}
            </TagWrapper>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <p>
              {manga.view?.totalView} <span>lượt xem</span>
            </p>
            <p>
              {manga._count.followedBy} <span>theo dõi</span>
            </p>
          </div>

          <div>
            <p className="text-lg lg:text-xl font-semibold">Mô tả</p>
            <MangaDesc manga={manga} />
          </div>

          <MangaTabs Manga={manga} />
        </section>
      </main>
    </>
  );
};

export default page;
