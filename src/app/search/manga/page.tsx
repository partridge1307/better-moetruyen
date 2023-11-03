import MangaImage from '@/components/Manga/components/MangaImage';
import { countFTResult, searchManga } from '@/lib/query';
import dynamic from 'next/dynamic';
import Link from 'next/link';
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
    countFTResult(query, 'Manga'),
  ]);

  return (
    <main className="container max-sm:px-2 mt-10 space-y-4">
      <h1 className="text-xl">Từ khóa: {query}</h1>

      {mangas.length ? (
        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-2 rounded-md bg-gradient-to-b from-background/40">
          {mangas.map((manga) => (
            <li key={manga.id}>
              <Link
                href={`/manga/${manga.slug}`}
                className="grid grid-cols-[.6fr_1fr] rounded-md group transition-colors hover:bg-primary-foreground"
              >
                <MangaImage
                  manga={manga}
                  sizes="(max-width: 640px) 25vw, 20vw"
                  className="group-hover:scale-105 transition-transform"
                />
                <div className="space-y-0.5 min-w-0 pl-4 px-2">
                  <p className="text-2xl lg:text-3xl line-clamp-2 font-semibold">
                    {manga.name}
                  </p>
                  <p className="line-clamp-3">{manga.slug}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Không có kết quả</p>
      )}

      <PaginationControll
        total={total[0].count}
        route={`/search/manga?q=${queryParam}`}
      />
    </main>
  );
};

export default page;
