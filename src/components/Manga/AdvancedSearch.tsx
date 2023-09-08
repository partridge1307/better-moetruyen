'use client';

import { Tags } from '@/lib/query';
import type { Manga, MangaAuthor } from '@prisma/client';
import dynamic from 'next/dynamic';
import { FC, useCallback, useState } from 'react';
import AdvancedMangaCard from './components/AdvancedMangaCard';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AdvancedSearchControll = dynamic(
  () => import('@/components/Manga/components/AdvancedSearchControll'),
  { ssr: false }
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
  intialData: { mangas: AdvancedMangas[]; lastCursor: number | undefined };
  tags: Tags[];
}

const AdvancedSearch: FC<AdvancedSearchProps> = ({ intialData, tags }) => {
  const [results, setResults] = useState(intialData.mangas);

  const onQueryStrChange = useCallback((query: string) => {
    console.log(query);
  }, []);

  return (
    <main className="container max-sm:px-2 pt-20 space-y-10">
      <AdvancedSearchControll tags={tags} onQueryStrChange={onQueryStrChange} />

      {!!results.length ? (
        <section className="grid grid-cols-2 gap-4">
          {results.map((manga) => (
            <AdvancedMangaCard key={manga.id} manga={manga} />
          ))}
        </section>
      ) : (
        <p>Không có kết quả</p>
      )}

      <section>
        <Button>
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <Button>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </section>
    </main>
  );
};

export default AdvancedSearch;
