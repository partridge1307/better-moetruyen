import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Manga } from '@prisma/client';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import { FC } from 'react';
import ShareButton from '../ShareButton';

const MangaFollow = dynamic(
  () => import('@/components/Manga/components/MangaFollow'),
  {
    ssr: false,
    loading: () => (
      <div className="w-32 md:w-[11.5rem] lg:w-[13.5rem] h-10 rounded-md bg-foreground" />
    ),
  }
);

interface MangaActionProps {
  manga: Pick<Manga, 'id' | 'slug' | 'name'>;
}

const MangaAction: FC<MangaActionProps> = async ({ manga }) => {
  const session = await getAuthSession();

  const hasFollowed = await checkFollow(manga.id, session);

  return (
    <>
      {!!session && <MangaFollow isFollow={!!hasFollowed} mangaId={manga.id} />}
      <ShareButton
        url={`/manga/${manga.slug}`}
        title={manga.name}
        className={!session ? 'w-32 md:w-[11.5rem]  lg:w-[13.5rem]' : ''}
      />
    </>
  );
};

export default MangaAction;

async function checkFollow(id: number, session: Session | null) {
  if (!session) return null;

  return await db.manga.findUnique({
    where: {
      id,
      followedBy: {
        some: {
          id: session.user.id,
        },
      },
    },
    select: {
      id: true,
    },
  });
}
