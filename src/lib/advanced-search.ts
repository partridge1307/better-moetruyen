import type { Prisma } from '@prisma/client';

const serializedIncludeQuery = (
  include: string | undefined,
  includeMode: 'or' | 'and'
) => {
  const includeSplittedArray =
    include?.split(',').map((id) => ({ tags: { some: { id: Number(id) } } })) ??
    [];

  if (!includeSplittedArray.length) {
    return;
  }

  const includeModeQuery = includeMode === 'and';
  const includeQuery = includeModeQuery
    ? { AND: includeSplittedArray }
    : { OR: includeSplittedArray };

  return includeQuery;
};

const serializedExcludeQuery = (
  exclude: string | undefined,
  excludeMode: 'or' | 'and'
) => {
  const excludeSplittedArray =
    exclude
      ?.split(',')
      .map((id) => ({ NOT: { tags: { some: { id: Number(id) } } } })) ?? [];

  if (!excludeSplittedArray.length) {
    return;
  }

  const excludeModeQuery = excludeMode === 'and';
  const excludeQuery = excludeModeQuery
    ? { AND: excludeSplittedArray }
    : { OR: excludeSplittedArray };

  return excludeQuery;
};

const serializedOrderByQuery = (
  sortBy: 'createdAt' | 'name' | 'followedBy' | 'view',
  order: 'asc' | 'desc'
) => {
  const sortByQuery: Prisma.MangaOrderByWithRelationAndSearchRelevanceInput = {
    [sortBy]:
      sortBy === 'view'
        ? { totalView: order }
        : sortBy === 'followedBy'
        ? { _count: order }
        : order,
  };

  return sortByQuery;
};

export {
  serializedExcludeQuery,
  serializedIncludeQuery,
  serializedOrderByQuery,
};
