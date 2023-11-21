'use client';

import classes from '@/styles/mantine/manga-info.module.css';
import { Spoiler } from '@mantine/core';
import '@mantine/core/styles.layer.css';
import { useMediaQuery } from '@mantine/hooks';
import type { Team } from '@prisma/client';
import { format } from 'date-fns';
import { Building } from 'lucide-react';
import dynamic from 'next/dynamic';
import { FC } from 'react';
import DescriptionSkeleton from '../Skeleton/DescriptionSkeleton';

const MTEditor = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  { ssr: false, loading: () => <DescriptionSkeleton /> }
);

interface TeamInfoProps {
  team: Pick<Team, 'id' | 'description' | 'createdAt'>;
  children: React.ReactNode;
}

const TeamInfo: FC<TeamInfoProps> = ({ team, children }) => {
  const isMobile = useMediaQuery('(max-width: 640px)');

  return (
    <>
      <Spoiler
        maxHeight={isMobile ? 120 : 288}
        showLabel={
          <p className="w-fit text-sm rounded-b-md px-2.5 py-0.5 bg-primary text-primary-foreground">
            Xem thêm
          </p>
        }
        hideLabel={
          <p className="w-fit text-sm rounded-b-md px-2.5 py-0.5 bg-primary text-primary-foreground">
            Lược bớt
          </p>
        }
        classNames={classes}
      >
        <MTEditor id={team.id} content={team.description} />

        {isMobile && (
          <div className="flex items-center gap-6">
            <dl className="flex items-center gap-1">
              <dt className="font-semibold">
                {format(team.createdAt, 'd/M/y')}
              </dt>
              <dd>
                <Building className="w-4 h-4" />
              </dd>
            </dl>
            {children}
          </div>
        )}
      </Spoiler>
      {!isMobile && (
        <div className="flex items-center gap-8">
          <dl className="flex items-center gap-1">
            <dt className="font-semibold">{format(team.createdAt, 'd/M/y')}</dt>
            <dd>
              <Building className="w-4 h-4" />
            </dd>
          </dl>
          {children}
        </div>
      )}
    </>
  );
};

export default TeamInfo;
