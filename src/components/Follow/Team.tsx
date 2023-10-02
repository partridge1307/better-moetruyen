'use client';

import { useFollow } from '@/hooks/use-follow';
import type { Team } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useEffect } from 'react';

type TeamFollowType = Pick<Team, 'id' | 'image' | 'name'> & {
  _count: {
    member: number;
    follows: number;
  };
};

interface TeamFollowProps {
  initialData: {
    follows: TeamFollowType[];
    lastCursor?: number;
  };
}

const TeamFollow: FC<TeamFollowProps> = ({ initialData }) => {
  const {
    follows,
    entry,
    hasNextPage,
    isFetchingNextPage,
    ref,
    fetchNextPage,
  } = useFollow<TeamFollowType>(initialData, 'team');

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, fetchNextPage, hasNextPage]);

  return (
    <>
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-2 rounded-md dark:bg-zinc-900/60">
        {follows.map((team, idx) => {
          if (idx === follows.length - 1)
            return (
              <Link
                ref={ref}
                key={team.id}
                href={`/team/${team.id}`}
                className="grid grid-cols-[.4fr_1fr] gap-6 rounded-md dark:bg-zinc-800"
              >
                <div className="relative aspect-square">
                  <Image
                    fill
                    sizes="(max-width: 640px) 25vw, 30vw"
                    quality={40}
                    src={team.image}
                    alt={`${team.name} Thumbnail`}
                    className="object-cover rounded-full"
                  />
                </div>

                <div className="text-sm space-y-1 md:space-y-3">
                  <p className="text-lg font-semibold">{team.name}</p>

                  <div>
                    <dl className="flex items-center gap-1.5">
                      <dt>Member:</dt>
                      <dd>{team._count.member}</dd>
                    </dl>

                    <dl className="flex items-center gap-1.5">
                      <dt>Theo dõi:</dt>
                      <dd>{team._count.follows}</dd>
                    </dl>
                  </div>
                </div>
              </Link>
            );
          else
            return (
              <Link
                key={team.id}
                href={`/team/${team.id}`}
                className="grid grid-cols-[.4fr_1fr] gap-6 rounded-md dark:bg-zinc-800"
              >
                <div className="relative aspect-square">
                  <Image
                    fill
                    sizes="(max-width: 640px) 25vw, 30vw"
                    quality={40}
                    src={team.image}
                    alt={`${team.name} Thumbnail`}
                    className="object-cover rounded-full"
                  />
                </div>

                <div className="text-sm space-y-1 md:space-y-3">
                  <p className="text-lg font-semibold">{team.name}</p>

                  <div>
                    <dl className="flex items-center gap-1.5">
                      <dt>Member:</dt>
                      <dd>{team._count.member}</dd>
                    </dl>

                    <dl className="flex items-center gap-1.5">
                      <dt>Theo dõi:</dt>
                      <dd>{team._count.follows}</dd>
                    </dl>
                  </div>
                </div>
              </Link>
            );
        })}
      </section>

      {isFetchingNextPage && (
        <p className="flex justify-center">
          <Loader2 className="w-10 h-10 animate-spin" />
        </p>
      )}
    </>
  );
};

export default TeamFollow;
