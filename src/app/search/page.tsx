import AdvancedMangaCard from '@/components/Manga/components/AdvancedMangaCard';
import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { buttonVariants } from '@/components/ui/Button';
import { db } from '@/lib/db';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface pageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const queryParam = searchParams['q'];
  if (!queryParam)
    return (
      <main className="container max-sm:px-2 mb-10">
        <p>Đường dẫn không hợp lệ</p>
      </main>
    );

  let query = typeof queryParam === 'string' ? queryParam : queryParam[0];

  const [mangas, users, forums] = await db.$transaction([
    db.manga.findMany({
      where: {
        name: {
          contains: query,
        },
        isPublished: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        image: true,
        review: true,
        createdAt: true,
        author: true,
        _count: {
          select: {
            chapter: true,
          },
        },
      },
      take: 10,
    }),
    db.user.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      select: {
        name: true,
        image: true,
        color: true,
      },
      take: 10,
    }),
    db.subForum.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      select: {
        slug: true,
        title: true,
        banner: true,
      },
      take: 10,
    }),
  ]);

  return (
    <main className="container max-sm:px-2 space-y-10 mb-8">
      <h1 className="text-lg font-semibold p-1 rounded-md dark:bg-zinc-900/60">
        Từ khóa: <span className="font-normal">{query}</span>
      </h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Manga</h2>

        <div className="rounded-md dark:bg-zinc-900/70">
          {!!mangas.length ? (
            mangas.map((manga, idx) => (
              <div key={idx} className="p-2">
                <AdvancedMangaCard manga={manga} />
              </div>
            ))
          ) : (
            <p className="p-2">Không có kết quả</p>
          )}
        </div>

        {!!mangas.length && (
          <Link
            href={`/search/manga?q=${queryParam}`}
            className={buttonVariants({
              variant: 'ghost',
              className: 'w-full',
            })}
          >
            <span>Xem thêm</span>
            <ArrowRight />
          </Link>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">User</h2>

        <div className="p-2 rounded-md dark:bg-zinc-900/70">
          {!!users.length ? (
            users.map((user, idx) => (
              <Link
                key={idx}
                href={`/user/${user.name?.split(' ').join('-')}`}
                className="flex gap-4 rounded-md p-2 transition-colors hover:dark:bg-zinc-800"
              >
                <UserAvatar user={user} className="w-20 h-20 border-4" />
                <Username user={user} className="text-xl font-semibold pt-1" />
              </Link>
            ))
          ) : (
            <p>Không có kết quả</p>
          )}
        </div>

        {!!users.length && (
          <Link
            href={`/search/user?q=${queryParam}`}
            className={buttonVariants({
              variant: 'ghost',
              className: 'w-full',
            })}
          >
            <span>Xem thêm</span>
            <ArrowRight />
          </Link>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Forum</h2>

        <div className="space-y-4 rounded-md dark:bg-zinc-900/60">
          {!!forums.length ? (
            forums.map((forum) => (
              <Link
                key={forum.slug}
                href={`${forum.slug}`}
                className="grid grid-cols-[.3fr_1fr] gap-4 p-2 rounded-md transition-colors hover:dark:bg-zinc-900"
              >
                {!!forum.banner && (
                  <div className="relative aspect-video">
                    <Image
                      fill
                      sizes="(max-width: 640px) 25vw, 30vw"
                      quality={40}
                      src={forum.banner}
                      alt={`${forum.title} Thumbnail`}
                      className="object-cover rounded-md"
                    />
                  </div>
                )}

                <p className="text-xl font-semibold">{forum.title}</p>
              </Link>
            ))
          ) : (
            <p className="p-2">Không có kết quả</p>
          )}
        </div>

        {!!forums.length && (
          <Link
            href={`/search/forum?q=${queryParam}`}
            className={buttonVariants({
              variant: 'ghost',
              className: 'w-full',
            })}
          >
            <span>Xem thêm</span>
            <ArrowRight />
          </Link>
        )}
      </section>
    </main>
  );
};

export default page;
