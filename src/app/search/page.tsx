import MangaImage from '@/components/Manga/components/MangaImage';
import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { searchForum, searchManga, searchUser } from '@/lib/query';
import { ChevronRight } from 'lucide-react';
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

  const [mangas, users, forums] = await Promise.all([
    searchManga({ searchPhrase: query, take: 10 }),
    searchUser({ searchPhrase: query, take: 10 }),
    searchForum({ searchPhrase: query, take: 10 }),
  ]);

  return (
    <main className="container max-sm:px-2 space-y-4 mt-10">
      <h1 className="text-xl">
        Từ khóa tìm kiếm: <span>{query}</span>
      </h1>

      <div className="grid md:grid-cols-[1fr_.5fr] gap-10 lg:gap-6">
        <section className="min-w-0 w-full h-fit p-2 space-y-12 rounded-md bg-gradient-to-b from-background/40">
          <div className="space-y-4">
            <div className="flex justify-between">
              <h1 className="text-xl font-semibold">Manga</h1>
              <Link
                aria-label="manga view more button"
                href={`/search/manga?q=${queryParam}`}
                className="relative flex items-center group"
              >
                <span className="pr-7 group-hover:pr-0 group-hover:pl-7 duration-300 transition-[padding]">
                  Xem thêm
                </span>
                <ChevronRight className="absolute right-0 group-hover:right-[calc(100%-25%)] duration-300 transition-[right]" />
              </Link>
            </div>
            {mangas.length ? (
              <ul className="grid md:grid-cols-2 gap-6">
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
                        <p className="text-2xl lg:text-3xl line-clamp-3 font-semibold">
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
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <h1 className="text-xl font-semibold">Forum</h1>
              <Link
                aria-label="forum view more button"
                href={`/search/forum?q=${queryParam}`}
                className="relative flex items-center group"
              >
                <span className="pr-7 group-hover:pr-0 group-hover:pl-7 duration-300 transition-[padding]">
                  Xem thêm
                </span>
                <ChevronRight className="absolute right-0 group-hover:right-[calc(100%-25%)] duration-300 transition-[right]" />
              </Link>
            </div>
            {forums.length ? (
              <ul className="grid md:grid-cols-2 gap-6">
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
          </div>
        </section>

        <section className="min-w-0 w-full h-fit p-2 space-y-4 rounded-md bg-gradient-to-b from-background/40">
          <div className="flex justify-between">
            <h1 className="text-xl font-semibold">Người dùng</h1>
            <Link
              aria-label="user view more button"
              href={`/search/user?q=${queryParam}`}
              className="relative flex items-center group"
            >
              <span className="pr-7 group-hover:pr-0 group-hover:pl-7 duration-300 transition-[padding]">
                Xem thêm
              </span>
              <ChevronRight className="absolute right-0 group-hover:right-[calc(100%-25%)] duration-300 transition-[right]" />
            </Link>
          </div>
          {users.length ? (
            <ul className="space-y-4">
              {users.map((user, idx) => (
                <li key={idx}>
                  <Link
                    href={`/user/${user.name.split(' ').join('-')}`}
                    className="grid grid-cols-[.3fr_1fr] gap-4 p-2 rounded-md group transition-colors hover:bg-primary-foreground"
                  >
                    <div className="relative aspect-square">
                      <UserAvatar
                        user={user}
                        className="w-full h-full bg-background border-4 border-muted"
                      />
                    </div>
                    <Username
                      user={user}
                      className="text-start text-xl lg:text-2xl font-semibold"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>Không có kết quả</p>
          )}
        </section>
      </div>
    </main>
  );
};

export default page;
