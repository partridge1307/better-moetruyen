import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/HoverCard';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { FC } from 'react';
const TabInfo = dynamic(() => import('@/components/User/TabInfo'));

interface pageProps {
  params: {
    slug: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const user = await db.user.findFirst({
    where: {
      name: params.slug.split('-').join(' '),
    },
    select: {
      id: true,
      name: true,
      image: true,
      banner: true,
      color: true,
      badge: true,
      _count: {
        select: {
          follows: true,
        },
      },
    },
  });
  if (!user) return notFound();

  return (
    <section className="container max-sm:px-2">
      <div className="flex flex-col gap-2">
        <div className="relative w-full h-56 lg:h-96">
          {user.banner ? (
            <Image
              fill
              sizes="40vw"
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
            className="w-28 h-28 lg:w-52 lg:h-52 border-4 lg:border-8 rounded-full absolute left-4 bottom-0 translate-y-1/2"
          />
        </div>

        <ul className="flex justify-end items-center">
          {!!user.badge.length &&
            user.badge.map((badge, idx) => (
              <li key={idx}>
                <HoverCard>
                  <HoverCardTrigger>
                    <Image
                      width={100}
                      height={100}
                      sizes="70vw"
                      src={badge.image}
                      alt={`${badge.name} Image`}
                      className="w-10 h-10"
                    />
                  </HoverCardTrigger>

                  <HoverCardContent>
                    <h1>{badge.name}</h1>
                    <p className="text-sm">{badge.description}</p>
                  </HoverCardContent>
                </HoverCard>
              </li>
            ))}
        </ul>

        <div
          className={cn('p-4 rounded-lg dark:bg-zinc-900 space-y-8', {
            'mt-24 lg:mt-32': !user.badge.length,
            'mt-16 lg:mt-28': user.badge.length,
          })}
        >
          <Username user={user} className="text-start text-xl font-semibold" />
          <div className="flex items-center space-x-2">
            <h1>Theo dõi:</h1>
            <span>{user._count.follows}</span>
          </div>

          <TabInfo userId={user.id} />
        </div>
      </div>
    </section>
  );
};

export default page;
