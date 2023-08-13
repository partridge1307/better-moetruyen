import AdvancedMangaCard from '@/components/Manga/AdvancedMangaCard';
import AdvancedSearchPagination from '@/components/Manga/AdvancedSearchPagination';
import { db } from '@/lib/db';
import { tagGroupByCategory } from '@/lib/query';
import { Prisma } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { FC } from 'react';
const AdvancedSearchControll = dynamic(
  () => import('@/components/Manga/AdvancedSearchControll'),
  { ssr: false, loading: () => <Loader2 className="w-6 h-6 animate-spin" /> }
);

export const metadata: Metadata = {
  title: 'Tìm kiếm nâng cao',
  description: 'Tìm kiếm nâng cao | Moetruyen',
  keywords: ['Tìm kiếm nâng cao', 'Nâng cao', 'Tìm kiếm', 'Manga', 'Moetruyen'],
  openGraph: {
    title: 'Tìm kiếm nâng cao',
    description: 'Tìm kiếm nâng cao | Moetruyen',
  },
  twitter: {
    title: 'Tìm kiếm nâng cao',
    description: 'Tìm kiếm nâng cao | Moetruyen',
  },
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

const Page: FC<pageProps> = async ({ searchParams }) => {
  const include = searchParams['include'];
  const exclude = searchParams['exclude'];
  const order = searchParams['order'] ?? 'createdAt.desc';
  const includeMode = searchParams['include_mode'] ?? 'and';
  const excludeMode = searchParams['exclude_mode'] ?? 'or';
  const queryName = searchParams['query_name'];
  const queryAuthor = searchParams['query_author'];
  const page = searchParams['page'] ?? '1';

  let whereClause: Prisma.MangaWhereInput = {},
    includeArr: number[] = [],
    includeQuery: any[] = [],
    excludeArr: number[] = [],
    excludeQuery: any[] = [],
    orderQuery: Prisma.MangaOrderByWithRelationAndSearchRelevanceInput = {
      createdAt: 'desc',
    },
    orderByField: 'createdAt' | 'name' | 'mangaFollow' | 'view' = 'createdAt',
    sortBy: 'asc' | 'desc' = 'desc',
    paginationQuery = '';

  if (include) {
    if (typeof include === 'string') {
      includeArr = include.trim().split(',').map(Number);

      includeQuery = includeArr.map((tagId) => ({
        tags: { some: { id: tagId } },
      }));
      paginationQuery = `include=${includeQuery.join(',')}`;
    } else {
      includeQuery = [];
    }
  }
  if (exclude) {
    if (typeof exclude === 'string') {
      excludeArr = exclude
        .trim()
        .split(',')
        .filter((tagId) => !include?.includes(tagId))
        .map(Number);

      excludeQuery = excludeArr.map((tagId) => ({
        NOT: { tags: { some: { id: tagId } } },
      }));
      paginationQuery = `${paginationQuery}&exclude=${excludeQuery.join(',')}`;
    } else {
      excludeQuery = [];
    }
  }

  if (includeQuery.length) {
    if (includeMode === 'and') {
      whereClause.AND = [...includeQuery];
      whereClause.OR = [];
      paginationQuery = `${paginationQuery}&include_mode=and`;
    } else {
      whereClause.OR = [...includeQuery];
      whereClause.AND = [];
      paginationQuery = `${paginationQuery}&include_mode=or`;
    }
  } else {
    whereClause.AND = [];
    whereClause.OR = [];
  }
  if (excludeQuery.length) {
    if (excludeMode === 'or') {
      whereClause.OR = [...whereClause.OR, ...excludeQuery];
      paginationQuery = `${paginationQuery}&exclude_mode=or`;
    } else {
      whereClause.AND = [...whereClause.AND, ...excludeQuery];
      paginationQuery = `${paginationQuery}&exclude_mode=and`;
    }
  }

  if (queryName && typeof queryName === 'string') {
    whereClause.name = {
      contains: queryName,
      mode: 'insensitive',
    };
    paginationQuery = `${paginationQuery}&query_name=${queryAuthor}`;
  }
  if (queryAuthor && typeof queryAuthor === 'string') {
    whereClause.author = {
      every: {
        name: {
          contains: queryAuthor,
          mode: 'insensitive',
        },
      },
    };
    paginationQuery = `${paginationQuery}&query_author=${queryAuthor}`;
  }

  if (!whereClause.AND.length) delete whereClause.AND;
  if (!whereClause.OR.length) delete whereClause.OR;

  if (typeof order === 'string') {
    const splittedOrder = order.trim().split('.');

    ['createdAt', 'name', 'mangaFollow', 'view'].includes(splittedOrder[0]) &&
      (orderByField = splittedOrder[0] as
        | 'createdAt'
        | 'name'
        | 'mangaFollow'
        | 'view');

    ['desc', 'asc'].includes(splittedOrder[1]) &&
      (sortBy = splittedOrder[1] as 'asc' | 'desc');

    switch (orderByField) {
      case 'view': {
        orderQuery = {
          view: {
            totalView: sortBy,
          },
        };
        paginationQuery = `${paginationQuery}&order=view.${sortBy}`;
        break;
      }
      case 'mangaFollow': {
        orderQuery = {
          mangaFollow: {
            _count: sortBy,
          },
        };
        paginationQuery = `${paginationQuery}&order=mangaFollow.${sortBy}`;
        break;
      }
      case 'name': {
        orderQuery = {
          name: sortBy,
        };
        paginationQuery = `${paginationQuery}&order=name.${sortBy}`;
        break;
      }
      default: {
        orderQuery = {
          createdAt: sortBy,
        };
        paginationQuery = `${paginationQuery}&order=createdAt.${sortBy}`;
        break;
      }
    }
  }

  let [mangas, tags, mangasCount] = await Promise.all([
    db.manga.findMany({
      where: whereClause,
      orderBy: orderQuery,
      select: {
        id: true,
        image: true,
        review: true,
        name: true,
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
      take: 10,
      skip: (Number(page) - 1) * 10,
    }),
    tagGroupByCategory(),
    db.manga.count({
      where: whereClause,
      orderBy: orderQuery,
    }),
  ]);

  if (includeArr.length) {
    tags = tags.map((tag) => ({
      category: tag.category,
      data: tag.data.map((d) => {
        if (includeArr.includes(d.id)) {
          return {
            choice: 1,
            ...d,
          };
        } else {
          return { choice: 0, ...d };
        }
      }),
    }));
  }
  if (excludeArr.length) {
    tags = tags.map((tag) => ({
      category: tag.category,
      data: tag.data.map((d) => {
        if (excludeArr.includes(d.id)) {
          return {
            choice: 2,
            id: d.id,
            name: d.name,
            description: d.description,
          };
        } else {
          return { ...d };
        }
      }),
    }));
  }
  if (!excludeArr.length && !includeArr.length) {
    tags = tags.map((tag) => ({
      category: tag.category,
      data: tag.data.map((t) => ({ choice: 0, ...t })),
    }));
  }

  return (
    <section className="container mx-auto max-sm:px-2 h-screen pt-20 space-y-10">
      <AdvancedSearchControll
        tags={tags as ExtendedTags[]}
        orderBy={`${orderByField}.${sortBy}`}
      />
      <ul
        className={
          'grid md:grid-cols-2 lg:grid-cols-3 gap-3 gap-y-6 p-2 dark:bg-zinc-700 rounded-lg'
        }
      >
        {mangas.length ? (
          mangas.map((manga, idx) => (
            <li key={idx}>
              <AdvancedMangaCard manga={manga} />
            </li>
          ))
        ) : (
          <li>Không có kết quả</li>
        )}
      </ul>

      <AdvancedSearchPagination
        page={typeof page === 'string' ? Number(page) : Number(page[0])}
        paginationQuery={paginationQuery}
        mangaCount={mangasCount}
      />
    </section>
  );
};

export default Page;
