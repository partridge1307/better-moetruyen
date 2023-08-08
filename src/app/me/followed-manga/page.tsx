import ForceSignOut from '@/components/ForceSignOut';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const FollowedManga = async () => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const [user, mangaFollowed] = await db.$transaction([
    db.user.findFirst({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
      },
    }),
    db.mangaFollow.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        manga: {
          select: {
            id: true,
            image: true,
            name: true,
            _count: {
              select: {
                chapter: true,
              },
            },
            chapter: {
              where: {
                isPublished: true,
              },
              select: {
                id: true,
                name: true,
                chapterIndex: true,
                volume: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    }),
  ]);
  if (!user) return <ForceSignOut />;

  return mangaFollowed.length ? (
    <ul className="flex flex-wrap gap-4">
      {mangaFollowed.map((follow, idx) => {
        const chapter = follow.manga.chapter[0];

        return (
          <li key={idx}>
            <Link
              href={`/chapter/${chapter.id}`}
              className="flex gap-2 p-2 rounded-lg dark:bg-zinc-800"
            >
              <Image
                width={0}
                height={0}
                sizes="0%"
                priority
                src={follow.manga.image}
                alt="Followed Manga Image"
                className="w-24 h-36 rounded object-cover"
              />

              <div className="p-1 space-y-2">
                <h2 className="text-lg font-semibold">{follow.manga.name}</h2>
                <p className="text-sm">
                  <span>Số Chapter:</span> {follow.manga._count.chapter}
                </p>

                <h5 className="text-sm">
                  <span>Vol. {chapter.volume}</span>{' '}
                  <span>Ch. {chapter.chapterIndex}</span>
                  {chapter.name ? <span> - {chapter.name}</span> : null}
                </h5>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  ) : (
    <div>Bạn chưa theo dõi bộ nào</div>
  );
};

export default FollowedManga;
