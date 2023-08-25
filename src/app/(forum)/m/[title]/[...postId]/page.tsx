import CommentSkeleton from '@/components/Comment/components/CommentSkeleton';
import PostVoteServer from '@/components/Forum/components/PostVoteServer';
import Username from '@/components/User/Username';
import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { ArrowBigDown, ArrowBigUp, Loader2, Pencil } from 'lucide-react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC, Suspense } from 'react';

const MTEditorOutput = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 rounded-md animate-pulse dark:bg-zinc-900">
        <div className="w-full h-96" />
      </div>
    ),
  }
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
    title: string;
    postId: string | string[];
  };
}

export async function generateMetadata({
  params,
}: pageProps): Promise<Metadata> {
  const postId =
    typeof params.postId === 'string' ? params.postId : params.postId[0];

  const post = await db.post.findFirst({
    where: {
      id: +postId,
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
      canonical: `${process.env.NEXTAUTH_URL}/m/${
        params.title
      }/${postId}/${post.title.split(' ').join('-')}`,
    },
    openGraph: {
      url: `${process.env.NEXTAUTH_URL}/m/${params.title}/${postId}/${post.title
        .split(' ')
        .join('-')}`,
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
  const postId =
    typeof params.postId === 'string' ? params.postId : params.postId[0];

  const [post, session] = await Promise.all([
    db.post.findFirst({
      where: {
        id: +postId,
      },
      select: {
        id: true,
        title: true,
        content: true,
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
          </div>

          <MTEditorOutput id={post.id} content={post.content} />
        </div>

        <div className="flex flex-wrap justify-between gap-6">
          <Suspense fallback={<PostVoteSkeleton />}>
            <PostVoteServer
              session={session}
              getData={() =>
                db.post.findUnique({
                  where: {
                    id: +postId,
                  },
                  select: {
                    id: true,
                    votes: true,
                  },
                })
              }
            />
          </Suspense>

          <div className="flex items-center gap-4">
            {!!(post.authorId === session?.user.id) && (
              <Link
                href={`/m/${params.title}/edit/${post.id}`}
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'flex items-center gap-2'
                )}
              >
                <Pencil className="w-5 h-5" /> Chỉnh sửa
              </Link>
            )}

            <PostShareButton
              url={`/m/${params.title}/${post.id}`}
              subForumSlug={params.title}
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

const PostVoteSkeleton = (): JSX.Element => (
  <div className="flex items-center gap-1 rounded-xl dark:bg-zinc-800">
    <div
      aria-label="up vote"
      className={buttonVariants({ variant: 'ghost', size: 'sm' })}
    >
      <ArrowBigUp className="w-6 h-6" />
    </div>
    <p>
      <Loader2 className="w-4 h-4 animate-spin" />
    </p>
    <div
      aria-label="down vote"
      className={buttonVariants({ variant: 'ghost', size: 'sm' })}
    >
      <ArrowBigDown className="w-6 h-6" />
    </div>
  </div>
);
