'use client';

import { Tags } from '@/lib/query';
import type { Manga, MangaAuthor } from '@prisma/client';
import dynamic from 'next/dynamic';
import { FC, useCallback, useState } from 'react';

const AdvancedSearchControll = dynamic(
  () => import('@/components/Manga/components/AdvancedSearchControll'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-44 lg:h-28 rounded-md animate-pulse dark:bg-zinc-900" />
    ),
  }
);
const PaginationControll = dynamic(
  () => import('@/components/PaginationControll'),
  {
    ssr: false,
    loading: () => (
      <div className="w-1/2 h-9 mx-auto rounded-md animate-pulse dark:bg-zinc-900" />
    ),
  }
);

export type AdvancedMangas = Pick<
  Manga,
  'id' | 'slug' | 'name' | 'image' | 'review' | 'createdAt'
> & {
  author: Pick<MangaAuthor, 'name'>[];
  _count: {
    chapter: number;
  };
};

interface AdvancedSearchProps {
  tags: Tags[];
  total: number;
  children: React.ReactNode;
}

const AdvancedSearch: FC<AdvancedSearchProps> = ({ tags, total, children }) => {
  const [query, setQuery] = useState('/advanced-search');

  const onQueryStrChange = useCallback((queryStr: string) => {
    setQuery(queryStr);
  }, []);

  return (
    <>
      <AdvancedSearchControll tags={tags} onQueryStrChange={onQueryStrChange} />

      {children}

      <PaginationControll total={total} route={query} />
    </>
  );
};

export default AdvancedSearch;
