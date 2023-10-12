import { db } from '@/lib/db';
import { searchManga } from '@/lib/query';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FC } from 'react';

const PaginationControll = dynamic(
  () => import('@/components/PaginationControll'),
  { ssr: false }
);

interface pageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const page = searchParams['page'] ?? '1';
  const limit = searchParams['limit'] ?? '10';
  const queryParam = searchParams['q'];
  if (!queryParam)
    return (
      <main className="container max-sm:px-2 mb-10">
        <p>Đường dẫn không hợp lệ</p>
      </main>
    );

  let query = typeof queryParam === 'string' ? queryParam : queryParam[0];

  const [mangas, total] = await Promise.all([
    searchManga({
      searchPhrase: query,
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
    }),
    db.manga.count({ where: { name: query, isPublished: true } }),
  ]);

  return (
    <main className="container mx-auto max-sm:px-2 space-y-10 mb-10">
      <h1 className="text-lg font-semibold p-1 rounded-md dark:bg-zinc-900/60">
        <span>Từ khóa:</span> {queryParam}
      </h1>

      {!!mangas.length ? (
        <div className="rounded-md p-2 space-y-6 dark:bg-zinc-900/60">
          {mangas.map((manga, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[.5fr_1fr] lg:grid-cols-[.1fr_1fr] gap-4 p-2 rounded-md transition-colors hover:dark:bg-zinc-800"
            >
              <div className="relative" style={{ aspectRatio: 4 / 3 }}>
                <Image
                  fill
                  sizes="(max-width: 640px) 25vw, 30vw"
                  quality={40}
                  src={manga.image}
                  alt={`${manga.name} Thumbnail`}
                  className="object-cover rounded-md"
                />
              </div>

              <div className="space-y-1.5">
                <p className="text-lg lg:text-xl font-semibold">{manga.name}</p>
                <p className="line-clamp-2">{manga.review}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Không tìm thấy Forum</p>
      )}

      <PaginationControll
        total={total}
        route={`/search/manga?q=${queryParam}`}
      />
    </main>
  );
};

export default page;
