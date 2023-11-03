import { countFTResult, searchForum } from '@/lib/query';
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

  const [forums, total] = await Promise.all([
    searchForum({
      searchPhrase: query,
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
    }),
    countFTResult(query, 'SubForum'),
  ]);

  return (
    <main className="container max-sm:px-2 space-y-4 mt-10">
      <h1 className="text-xl">Từ khóa: {query}</h1>

      {forums.length ? (
        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-2 rounded-md bg-gradient-to-b from-background/40">
          {forums.map((forum, idx) => (
            <li key={idx}>
              <a
                target="_blank"
                href={`${process.env.NEXT_PUBLIC_FORUM_URL}/${forum.slug}`}
                className="block space-y-1.5 group transition-colors hover:bg-primary-foreground"
              >
                <div className="relative aspect-video">
                  {!!forum.banner ? (
                    <Image
                      fill
                      sizes="(max-width: 640px) 25vw, 20vw"
                      src={forum.banner}
                      alt={`Ảnh bìa ${forum.title}`}
                      className="object-cover rounded-md transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-foreground rounded-md" />
                  )}
                </div>
                <p className="text-2xl lg:text-3xl line-clamp-3 px-2 font-semibold">
                  {forum.title}
                </p>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>Không có kết quả</p>
      )}

      <PaginationControll
        total={total[0].count}
        route={`/search/forum?q=${queryParam}`}
      />
    </main>
  );
};

export default page;
