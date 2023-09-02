import CommentSkeleton from '@/components/Comment/components/CommentSkeleton';
import PostVoteSkeleton from '@/components/Forum/components/PostVoteSkeleton';
import Username from '@/components/User/Username';
import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn, formatTimeToNow } from '@/lib/utils';
import { Pencil } from 'lucide-react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const MTEditorOutput = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  {
    ssr: false,
  }
);
const PostVoteServer = dynamic(
  () => import('@/components/Forum/components/PostVoteServer'),
  { loading: () => <PostVoteSkeleton /> }
);
const PostShareButton = dynamic(
  () => import('@/components/Forum/components/PostShareButton'),
  { ssr: false }
);
const Comments = dynamic(() => import('@/components/Comment/Post'), {
  ssr: false,
  loading: () => <CommentSkeleton />,
});

interface pageProps {
  params: {
    slug: string;
    postId: string;
  };
}

export async function generateMetadata({
  params,
}: pageProps): Promise<Metadata> {
  const post = await db.post.findUnique({
    where: {
      id: +params.postId,
    },
    select: {
      title: true,
      subForum: {
        select: {
          title: true,
          banner: true,
        },
      },
    },
  });

  if (!post)
    return {
      title: 'Bài viết',
      description: 'Bài viết | Moetruyen',
    };

  return {
    title: {
      default: post.title,
      absolute: post.title,
    },
    description: `Bài viết ${post.title} - ${post.subForum.title} | Moetruyen`,
    keywords: ['Post', 'Forum', post.title, post.subForum.title, 'Moetruyen'],
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/m/${params.slug}/${params.postId}`,
    },
    openGraph: {
      url: `${process.env.NEXTAUTH_URL}/m/${params.slug}/${params.postId}`,
      siteName: 'Moetruyen',
      title: post.title,
      description: `Bài viết ${post.title} - ${post.subForum.title} | Moetruyen`,
      images: [
        {
          url: post.subForum.banner ?? '',
          alt: `Ảnh bìa ${post.subForum.title}`,
        },
      ],
    },
    twitter: {
      site: 'Moetruyen',
      title: post.title,
      description: `Bài viết ${post.title} - ${post.subForum.title} | Moetruyen`,
      card: 'summary_large_image',
      images: [
        {
          url: post.subForum.banner ?? '',
          alt: `Ảnh bìa ${post.subForum.title}`,
        },
      ],
    },
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const [post, session] = await Promise.all([
    db.post.findUnique({
      where: {
        id: +params.postId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        author: {
          select: {
            name: true,
            color: true,
          },
        },
      },
    }),
    getAuthSession(),
  ]);
  if (!post) return notFound();

  return (
    <div className="space-y-16">
      <div className="p-2 rounded-md dark:bg-zinc-700">
        <div className="space-y-10">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">{post.title}</h1>
            <h2 className="flex items-center gap-2 text-sm">
              <span>Đăng bởi</span>{' '}
              <Link href={`/user/${post.author.name?.split(' ').join('-')}`}>
                <Username user={post.author} />
              </Link>
            </h2>
            <div className="flex flex-col lg:flex-row lg:items-center lg:divide-x-2 lg:dark:divide-zinc-500">
              <p className="text-sm lg:pr-1">
                Tạo:{' '}
                <time dateTime={post.createdAt.toDateString()}>
                  {formatTimeToNow(new Date(post.createdAt))}
                </time>
              </p>
              <p className="text-sm lg:pl-1">
                Cập nhật:{' '}
                <time dateTime={post.updatedAt.toDateString()}>
                  {formatTimeToNow(new Date(post.updatedAt))}
                </time>
              </p>
            </div>
          </div>

          <MTEditorOutput id={post.id} content={post.content} />
        </div>

        <div className="flex flex-wrap justify-between gap-6">
          <PostVoteServer
            session={session}
            getData={() =>
              db.post.findUnique({
                where: {
                  id: +params.postId,
                },
                select: {
                  id: true,
                  votes: true,
                },
              })
            }
          />

          <div className="flex items-center gap-4">
            {!!(post.authorId === session?.user.id) && (
              <Link
                href={`/m/${params.slug}/edit/${post.id}`}
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'flex items-center gap-2'
                )}
              >
                <Pencil className="w-5 h-5" /> Chỉnh sửa
              </Link>
            )}

            <PostShareButton
              url={`/m/${params.slug}/${post.id}`}
              title={post.title}
            />
          </div>
        </div>
      </div>

      <div className="space-y-10 pb-10">
        <h1 className="text-xl font-semibold">Bình luận</h1>

        <Comments postId={post.id} />
      </div>
    </div>
  );
};

export default page;
