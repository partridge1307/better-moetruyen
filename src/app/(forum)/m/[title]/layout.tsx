import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import Username from '@/components/User/Username';
import { AspectRatio } from '@/components/ui/AspectRatio';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/Button';

const SubscribeOrLeave = dynamic(
  () => import('@/components/Forum/components/SubscribeOrLeave'),
  { ssr: false }
);
const DeleteThreadButton = dynamic(
  () => import('@/components/Forum/components/DeleteThreadButton'),
  { ssr: false }
);

interface layoutProps {
  params: {
    title: string;
  };
  children: React.ReactNode;
}

export async function generateMetadata({
  params,
}: layoutProps): Promise<Metadata> {
  const title = params.title.split('-').join(' ');

  const subForum = await db.subForum.findFirst({
    where: {
      title,
    },
    select: {
      title: true,
      banner: true,
    },
  });

  if (!subForum)
    return {
      title: 'Forum',
      description: 'Forum | Moetruyen',
    };

  return {
    title: {
      default: subForum.title,
      absolute: subForum.title,
    },
    description: `Cộng đồng ${subForum.title} | Moetruyen`,
    keywords: [`Forum`, `${subForum.title}`, 'Moetruyen'],
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/m/${params.title}`,
    },
    openGraph: {
      url: `${process.env.NEXTAUTH_URL}/m/${params.title}`,
      siteName: 'Moetruyen',
      title: subForum.title,
      description: `Cộng đồng ${subForum.title} | Moetruyen`,
      images: [
        {
          url: subForum.banner ?? '',
          alt: `Ảnh bìa ${subForum.title}`,
        },
      ],
    },
    twitter: {
      site: 'Moetruyen',
      title: subForum.title,
      description: `Cộng đồng ${subForum.title} | Moetruyen`,
      card: 'summary_large_image',
      images: [
        {
          url: subForum.banner ?? '',
          alt: `Ảnh bìa ${subForum.title}`,
        },
      ],
    },
  };
}

const layout: FC<layoutProps> = async ({ params, children }) => {
  const title = params.title.split('-').join(' ');
  const session = await getAuthSession();

  const [subForum, subscription] = await db.$transaction([
    db.subForum.findFirst({
      where: {
        title,
      },
      select: {
        id: true,
        title: true,
        banner: true,
        createdAt: true,
        creatorId: true,
        creator: {
          select: {
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    }),
    db.subscription.findFirst({
      where: {
        subForum: {
          title,
        },
        userId: session?.user.id,
      },
    }),
  ]);
  if (!subForum) return notFound();

  return (
    <section className="container max-sm:px-2 pt-20">
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_.45fr] gap-6">
        <div className="flex flex-col gap-y-6">{children}</div>

        <div className="max-sm:order-first h-fit rounded-md dark:bg-zinc-900">
          {!!subForum.banner && (
            <AspectRatio ratio={16 / 9}>
              <Image
                priority
                fill
                sizes="(max-width: 648px) 50vw, 40vw"
                quality={40}
                src={subForum.banner}
                alt={`${subForum.title} Banner`}
                className="rounded-t-md object-cover"
              />
            </AspectRatio>
          )}

          <h1
            className={cn('text-lg font-medium p-3 dark:bg-zinc-700', {
              'rounded-t-md': !!!subForum.banner,
            })}
          >
            m/{subForum.title}
          </h1>

          <div className="p-3 divide-y dark:divide-zinc-700">
            <dl className="flex justify-between py-4">
              <dt>Tạo từ</dt>
              <dd>
                <time dateTime={subForum.createdAt.toDateString()}>
                  {format(new Date(subForum.createdAt), 'd/M/yyyy')}
                </time>
              </dd>
            </dl>

            <dl className="flex justify-between py-4">
              <dt>Member</dt>
              <dd>{subForum._count.subscriptions}</dd>
            </dl>

            <dl className="flex justify-between py-4">
              <dt>Tạo bởi</dt>
              <dd>
                <Username user={subForum.creator} />
              </dd>
            </dl>

            {subForum.creatorId === session?.user.id && (
              <>
                <Link
                  href={`/m/${subForum.title.split(' ').join('-')}/edit`}
                  className={cn(buttonVariants(), 'w-full mb-4')}
                >
                  Chỉnh sửa
                </Link>
                <DeleteThreadButton subForumId={subForum.id} />
              </>
            )}

            {subForum.creatorId !== session?.user.id && (
              <SubscribeOrLeave
                subForumId={subForum.id}
                isSubscribed={!!subscription}
              />
            )}
          </div>
        </div>
      </section>
    </section>
  );
};

export default layout;
