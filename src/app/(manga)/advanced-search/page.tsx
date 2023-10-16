import AdvancedMangaCard from '@/components/Manga/components/AdvancedMangaCard';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import {
  serializedExcludeQuery,
  serializedIncludeQuery,
  serializedOrderByQuery,
} from '@/lib/advanced-search';
import { db } from '@/lib/db';
import { tagGroupByCategory } from '@/lib/query';
import type { Prisma } from '@prisma/client';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { FC } from 'react';

const AdvancedSearch = dynamic(
  () => import('@/components/Manga/AdvancedSearch'),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'Tìm kiếm nâng cao',
  description: 'Tìm kiếm nâng cao | Moetruyen',
  keywords: ['Tìm kiếm nâng cao', 'Nâng cao', 'Tìm kiếm', 'Manga', 'Moetruyen'],
};

export type ExtendedTags = {
  category: string;
  data: {
    choice: number;
    id: number;
    name: string;
    description: string;
  }[];
};

interface pageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const convertSearchParams = ({ searchParams }: pageProps) => {
  const includeParams = searchParams['include'];
  const includeModeParams = searchParams['includeMode'] ?? 'and';
  const excludeParams = searchParams['exclude'];
  const excludeModeParams = searchParams['excludeMode'] ?? 'or';
  const sortByParams = searchParams['sortBy'] ?? 'createdAt';
  const orderParams = searchParams['order'] ?? 'desc';
  const nameParams = searchParams['name'];
  const authorParams = searchParams['author'];
  const limitParams = searchParams['limit'] ?? '10';
  const pageParams = searchParams['page'] ?? '1';

  // Convert include
  const include = includeParams
    ? typeof includeParams === 'string'
      ? includeParams
      : includeParams.filter(Number).shift()
    : undefined;
  const includeMode = includeModeParams
    ? typeof includeModeParams === 'string'
      ? includeModeParams === 'and'
        ? includeModeParams
        : 'or'
      : includeModeParams.includes('and')
      ? 'and'
      : 'or'
    : 'and';

  // Convert exclude
  const exclude = excludeParams
    ? typeof excludeParams === 'string'
      ? excludeParams
      : excludeParams.filter(Number).shift()
    : undefined;
  const excludeMode = excludeModeParams
    ? typeof excludeModeParams === 'string'
      ? excludeModeParams === 'and'
        ? excludeModeParams
        : 'or'
      : excludeModeParams.includes('and')
      ? 'and'
      : 'or'
    : 'or';

  // Convert name
  const name = nameParams
    ? typeof nameParams === 'string'
      ? nameParams
      : nameParams.shift()
    : undefined;

  // Convert author
  const author = authorParams
    ? typeof authorParams === 'string'
      ? authorParams
      : authorParams.shift()
    : undefined;

  // Convert order by
  const sortBy = sortByParams
    ? typeof sortByParams === 'string'
      ? sortByParams === 'name' ||
        sortByParams === 'mangaFollow' ||
        sortByParams === 'view'
        ? sortByParams
        : 'createdAt'
      : sortByParams.find(
          (param) =>
            param === 'name' || param === 'followedBy' || param === 'view'
        ) ?? 'createdAt'
    : 'createdAt';
  const order = orderParams
    ? typeof orderParams === 'string'
      ? orderParams === 'asc'
        ? orderParams
        : 'desc'
      : orderParams.includes('asc')
      ? 'asc'
      : 'desc'
    : 'desc';

  // Convert limit
  const limit = limitParams
    ? typeof limitParams === 'string'
      ? Number(limitParams)
      : Number(limitParams.shift())
    : INFINITE_SCROLL_PAGINATION_RESULTS;

  // Convert cursor
  const page = pageParams
    ? typeof pageParams === 'string'
      ? pageParams
      : pageParams[0]
    : '1';

  return {
    include,
    includeMode: includeMode as 'or' | 'and',
    exclude,
    excludeMode: excludeMode as 'or' | 'and',
    sortBy: sortBy as 'name' | 'createdAt' | 'followedBy' | 'view',
    order: order as 'asc' | 'desc',
    name,
    author,
    limit,
    page,
  };
};

const Page: FC<pageProps> = async ({ searchParams }) => {
  const {
    include,
    includeMode,
    exclude,
    excludeMode,
    sortBy,
    order,
    name,
    author,
    limit,
    page,
  } = convertSearchParams({ searchParams });

  let whereQuery: Prisma.MangaWhereInput = { isPublished: true };

  // Where
  // Include tags
  const includeQuery = serializedIncludeQuery(include, includeMode);
  if (includeQuery && includeQuery.AND) {
    whereQuery.AND = [...includeQuery.AND];
  } else if (includeQuery && includeQuery.OR) {
    whereQuery.OR = [...includeQuery.OR];
  }

  // Exclude tags
  const excludeQuery = serializedExcludeQuery(exclude, excludeMode);
  if (excludeQuery && excludeQuery.AND) {
    whereQuery.AND = [...excludeQuery.AND];
  } else if (excludeQuery && excludeQuery.OR) {
    whereQuery.OR = [...excludeQuery.OR];
  }

  // Include Name
  !!name &&
    (whereQuery.name = {
      contains: name,
      mode: 'insensitive',
    });

  // Include author
  !!author &&
    (whereQuery.author = {
      some: {
        name: {
          contains: author,
          mode: 'insensitive',
        },
      },
    });

  const [mangas, totalMangas, tags] = await Promise.all([
    db.manga.findMany({
      where: whereQuery,
      orderBy: serializedOrderByQuery(sortBy, order),
      select: {
        id: true,
        slug: true,
        name: true,
        image: true,
        review: true,
        createdAt: true,
        author: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            chapter: true,
          },
        },
      },
      take: limit,
      skip: (parseInt(page) - 1) * limit,
    }),
    db.manga.count({
      where: whereQuery,
      orderBy: serializedOrderByQuery(sortBy, order),
    }),
    tagGroupByCategory(),
  ]);

  return (
    <main className="container max-sm:px-2 space-y-10">
      <AdvancedSearch tags={tags} total={totalMangas}>
        {!!mangas.length ? (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-2">
            {mangas.map((manga) => (
              <AdvancedMangaCard key={manga.id} manga={manga} />
            ))}
          </section>
        ) : (
          <p>Không có kết quả</p>
        )}
      </AdvancedSearch>
    </main>
  );
};

export default Page;
