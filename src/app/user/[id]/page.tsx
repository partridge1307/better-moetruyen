import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import { db } from '@/lib/db';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { FC } from 'react';

interface pageProps {
  params: {
    id: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const user = await db.user.findFirst({
    where: {
      id: params.id,
    },
    select: {
      name: true,
      image: true,
      banner: true,
      color: true,
      badge: true,
      manga: {
        select: {
          id: true,
          image: true,
          name: true,
        },
      },
      _count: {
        select: {
          follows: true,
        },
      },
    },
  });
  if (!user) return notFound();

  return (
    <section className="container max-sm:px-2 pt-20">
      <div className="flex flex-col gap-2">
        <div className="relative w-full h-72 lg:h-96 mb-28 lg:mb-36">
          {user.banner ? (
            <Image
              fill
              sizes="30vw"
              priority
              src={user.banner}
              alt="User Banner"
              className="object-cover rounded-lg"
            />
          ) : (
            <div className="absolute inset-0 top-0 left-0 dark:bg-zinc-900" />
          )}

          <UserAvatar
            user={user}
            className="w-40 h-40 lg:w-52 lg:h-52 border-8 rounded-full absolute top-1/2 translate-y-1/3 translate-x-1/3"
          />
        </div>

        <div className="p-2">
          <Username user={user} className="text-start text-lg" />
        </div>
      </div>
    </section>
  );
};

export default page;
