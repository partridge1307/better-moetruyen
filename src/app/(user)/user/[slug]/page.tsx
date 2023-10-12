import UserAvatar from '@/components/User/UserAvatar';
import UserBanner from '@/components/User/UserBanner';
import Username from '@/components/User/Username';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import format from 'date-fns/format';
import vi from 'date-fns/locale/vi';
import { Users2, Wifi } from 'lucide-react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const UserBadge = dynamic(() => import('@/components/User/UserBadge'), {
  ssr: false,
  loading: () => (
    <div className="h-8 ml-28 lg:ml-32 my-3 mr-1 rounded-md animate-pulse bg-background" />
  ),
});

const FollowButton = dynamic(() => import('@/components/User/FollowButton'), {
  ssr: false,
  loading: () => (
    <div className="h-10 rounded-md animate-pulse bg-background" />
  ),
});

interface pageProps {
  params: {
    slug: string;
  };
}

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
      banner: true,
    },
  });

  if (!user)
    return {
      title: 'Người dùng',
      description: `Người dùng ${params.slug} | Moetruyen`,
      alternates: {
        canonical: `${process.env.NEXTAUTH_URL}/user/${params.slug}`,
      },
    };

  return {
    title: {
      default: user.name ?? 'Người dùng',
      absolute: user.name ?? 'Người dùng',
    },
    description: `Người dùng ${user.name} | Moetruyen`,
    keywords: ['User', user.name ?? 'Người dùng', 'Moetruyen'],
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/user/${params.slug}`,
    },
    openGraph: {
      url: `${process.env.NEXTAUTH_URL}/user/${params.slug}`,
      siteName: 'Moetruyen',
      title: user.name ?? 'Người dùng',
      description: `Người dùng ${user.name} | Moetruyen`,
      locale: 'vi_VN',
      ...(!!user.image && {
        images: [
          {
            url: user.image,
            alt: `Ảnh đại diện ${user.name}`,
          },
        ],
      }),
    },
    twitter: {
      site: 'Moetruyen',
      title: user.name ?? 'Người dùng',
      description: `Người dùng ${user.name} | Moetruyen`,
      ...(!!user.image && {
        card: 'summary',
        images: [
          {
            url: user.image,
            alt: `Ảnh đại diện ${user.name}`,
          },
        ],
      }),
    },
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const session = await getAuthSession();

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
      createdAt: true,
      _count: {
        select: {
          manga: true,
          subForum: true,
          following: true,
          followedBy: true,
        },
      },
      followedBy: {
        where: {
          id: session?.user.id,
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!user) return notFound();

  return (
    <>
      <div className="relative">
        <UserBanner user={user} className="rounded-md" />
        <UserAvatar
          user={user}
          className="absolute w-20 h-20 md:w-24 md:h-24 bottom-0 left-4 translate-y-1/2 border-4 dark:border-zinc-800 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-wrap ml-28 md:ml-32 my-3 mr-1 justify-end items-center gap-3">
        {!!user.badge.length &&
          user.badge.map((badge) => <UserBadge key={badge.id} badge={badge} />)}
      </div>

      {!!session && session.user.id !== user.id && (
        <FollowButton
          user={user}
          sessionUserId={session.user.id}
          hasBadge={!!user.badge.length}
        />
      )}

      <div
        className={`${
          session && session.user.id !== user.id
            ? 'mt-2 lg:mt-3'
            : !!user.badge.length
            ? 'mt-5 lg:mt-7'
            : 'mt-16 lg:mt-20'
        } p-4 rounded-md dark:bg-zinc-800`}
      >
        <Username user={user} className="text-start text-lg font-semibold" />

        <hr className="h-0.5 rounded-full dark:bg-zinc-50 my-4" />

        <div className="flex flex-wrap justify-between items-center gap-2">
          <dl className="flex items-center gap-1.5 max-sm:w-full">
            <dt>Đang theo dõi:</dt>
            <dd className="flex items-center gap-0.5">
              {user._count.followedBy} <Wifi className="w-5 h-5 rotate-45" />
            </dd>
          </dl>

          <dl className="flex items-center gap-1.5 max-sm:w-full">
            <dt>Người theo dõi:</dt>
            <dd className="flex gap-1">
              {user._count.following} <Users2 className="w-5 h-5" />
            </dd>
          </dl>
        </div>

        <hr className="h-0.5 rounded-full dark:bg-zinc-50 my-4" />

        <div className="flex flex-wrap justify-between items-center gap-2">
          <dl className="flex items-center gap-1.5">
            <dt>Manga:</dt>
            <dd>{user._count.manga}</dd>
          </dl>

          <dl className="flex items-center gap-1.5">
            <dt>Forum:</dt>
            <dd>{user._count.subForum}</dd>
          </dl>
        </div>

        <hr className="h-0.5 rounded-full dark:bg-zinc-50 my-4" />

        <dl className="flex items-center gap-1.5">
          <dt>Gia nhập:</dt>
          <dd>
            <time dateTime={user.createdAt.toDateString()}>
              {format(new Date(user.createdAt), 'd MMM y', { locale: vi })}
            </time>
          </dd>
        </dl>
      </div>
    </>
  );
};

export default page;
