import { db } from '@/lib/db';
import { searchForum } from '@/lib/query';
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
    db.subForum.count({ where: { title: query } }),
  ]);

  return (
    <main className="container mx-auto max-sm:px-2 space-y-10 mb-10">
      <h1 className="text-lg font-semibold p-1 rounded-md dark:bg-zinc-900/60">
        <span>Từ khóa:</span> {queryParam}
      </h1>

      {!!forums.length ? (
        <div className="rounded-md dark:bg-zinc-900/60">
          {forums.map((forum) => (
            <a
              key={forum.slug}
              target="_blank"
              href={`${process.env.NEXT_PUBLIC_FORUM_URL}/${forum.slug}`}
              className="grid grid-cols-[.3fr_1fr] gap-4 rounded-md p-2 transition-colors hover:dark:bg-zinc-900"
            >
              {!!forum.banner && (
                <div className="relative aspect-video">
                  <Image
                    fill
                    sizes="(max-width: 640px) 25vw, 30vw"
                    quality={40}
                    src={forum.banner}
                    alt={`${forum.title} Thumbnail`}
                    className="rounded-md object-cover"
                  />
                </div>
              )}
              <p className="text-xl font-semibold">{forum.title}</p>
            </a>
          ))}
        </div>
      ) : (
        <p>Không tìm thấy Forum</p>
      )}

      <PaginationControll
        total={total}
        route={`/search/forum?q=${queryParam}`}
      />
    </main>
  );
};

export default page;
