'use client';

import MangaCard from '@/components/Manga/components/MangaCard';
import { TabsContent } from '@/components/ui/Tabs';
import { useTeamInfo } from '@/hooks/use-team-info';
import { useIntersection } from '@mantine/hooks';
import type { Chapter, Manga } from '@prisma/client';
import { FC, useEffect, useRef } from 'react';

type TManga = Pick<
  Manga,
  'slug' | 'image' | 'name' | 'review' | 'createdAt'
> & {
  chapter: Pick<
    Chapter,
    'id' | 'volume' | 'chapterIndex' | 'name' | 'createdAt'
  >[];
};

interface MangaInfoProps {
  teamId: number;
  initialContent: {
    data: TManga[];
    lastCursor?: number;
  };
}

const MangaInfo: FC<MangaInfoProps> = ({ initialContent, teamId }) => {
  const lastMangaRef = useRef(null);
  const { ref, entry } = useIntersection({
    root: lastMangaRef.current,
    threshold: 1,
  });

  const { data, query } = useTeamInfo<TManga>({
    initialContent,
    teamId,
    type: 'manga',
  });

  useEffect(() => {
    if (entry?.isIntersecting && query.hasNextPage) {
      query.fetchNextPage();
    }
  }, [entry?.isIntersecting, query]);

  return (
    <TabsContent
      value="manga"
      forceMount
      className="data-[state=inactive]:hidden p-2 rounded-md bg-primary-foreground/50"
    >
      {!data.length && <p>Team hiện chưa có bộ truyện nào</p>}

      <ul className="grid md:grid-cols-2 gap-4 md:gap-6">
        {data.map((manga, index) => {
          if (index === data.length - 1)
            return (
              <li ref={ref} key={`${manga.slug}-${index}`}>
                <MangaCard manga={manga} />
              </li>
            );
          else
            return (
              <li key={`${manga.slug}-${index}`}>
                <MangaCard manga={manga} />
              </li>
            );
        })}
      </ul>
    </TabsContent>
  );
};

export default MangaInfo;
