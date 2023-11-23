import UserInfoSkeleton from '@/components/Skeleton/UserInfoSkeleton';
import UserAction from '@/components/User/UserAction';
import UserAvatar from '@/components/User/UserAvatar';
import UserBadge from '@/components/User/UserBadge';
import UserBanner from '@/components/User/UserBanner';
import UserFunction from '@/components/User/UserFunction';
import Username from '@/components/User/Username';
import { db } from '@/lib/db';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const UserInfo = dynamic(() => import('@/components/User/UserInfo'), {
  loading: () => <UserInfoSkeleton />,
});

interface pageProps {
  params: {
    slug: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const user = await db.user.findUnique({
    where: {
      name: params.slug.split('-').join(' '),
    },
    select: {
      id: true,
      image: true,
      banner: true,
      name: true,
      color: true,
      badge: true,
    },
  });
  if (!user) return notFound();

  return (
    <main className="relative container max-sm:px-0 mt-4 pb-4 lg:w-4/5">
      {/* Info section */}
      <section className="p-2 pb-4 rounded-t-md bg-primary-foreground">
        {/* Image section */}
        <section className="relative">
          <UserBanner user={user} className="rounded-md bg-background" />
          <UserAvatar
            user={user}
            className="absolute left-[5%] md:left-[3%] bottom-0 translate-y-1/2 w-24 h-24 md:w-40 md:h-40 border-[5px] border-muted bg-background"
          />
        </section>
        {/* Name and Badge section */}
        <section className="ml-[5%] md:ml-56 mt-2.5 mb-3 md:mb-16 flex items-start justify-between">
          <Username
            user={user}
            className="text-start text-xl md:text-2xl font-semibold max-sm:mt-14"
          />
          {!!user.badge.length && (
            <div className="shrink-0 max-w-[200px] flex flex-wrap items-center gap-4">
              {user.badge.map((badge) => (
                <UserBadge key={badge.id} badge={badge} />
              ))}
            </div>
          )}
        </section>
        {/* Function section */}
        <section className="ml-[4%] mb-5 space-x-6">
          <UserFunction user={user} />
        </section>
        {/* Count info section */}
        <section className="ml-[4%] space-y-1">
          <UserInfo user={user} />
        </section>
      </section>

      {/* Action section */}
      <section>
        <UserAction user={user} />
      </section>
    </main>
  );
};

export default page;

export async function generateMetadata({
  params,
}: pageProps): Promise<Metadata> {
  const user = await db.user.findUnique({
    where: {
      name: params.slug.split('-').join(' '),
    },
    select: {
      name: true,
      image: true,
    },
  });

  if (!user)
    return {
      title: 'Người dùng',
      description: 'User, người dùng | Moetruyen',
      alternates: {
        canonical: `${process.env.NEXTAUTH_URL}/user/${params.slug
          .split(' ')
          .join('-')}`,
      },
    };

  return {
    title: {
      absolute: user.name ?? 'Người dùng',
      default: user.name ?? 'Người dùng',
    },
    description: `Thông tin người dùng ${user.name} | Moetruyen`,
    keywords: [`User`, 'Người dùng', `${user.name}`, 'Moetruyen'],
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/user/${params.slug
        .split(' ')
        .join('-')}`,
    },
    openGraph: {
      url: `${process.env.NEXTAUTH_URL}/user/${params.slug
        .split(' ')
        .join('-')}`,
      siteName: 'Moetruyen',
      title: user.name ?? 'Người dùng',
      description: `Thông tin người dùng ${user.name} | Moetruyen`,
      locale: 'vi_VN',
      ...(!!user.image && {
        images: [
          {
            url: user.image,
            alt: `Ảnh ${user.name}`,
          },
        ],
      }),
    },
    twitter: {
      site: 'Moetruyen',
      title: user.name ?? 'Người dùng',
      description: `Thông tin người dùng ${user.name} | Moetruyen`,
      ...(!!user.image && {
        card: 'summary',
        images: [
          {
            url: user.image,
            alt: `Ảnh ${user.name}`,
          },
        ],
      }),
    },
  };
}
