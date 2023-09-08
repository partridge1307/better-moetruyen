import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback } from 'react';

type QueryProps = {
  include: number[];
  includeMode: string;
  exclude: number[];
  excludeMode: string;
  sortBy: string;
  order: string;
  name: string;
  author: string;
};

const useAdvancedSearch = <TData>({
  include,
  includeMode,
  exclude,
  excludeMode,
  sortBy,
  order,
  name,
  author,
}: QueryProps) => {
  const getMangas = useCallback(
    async ({ pageParam = undefined }) => {
      let query = `/api/search/advanced-search?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&includeMode=${includeMode}&excludeMode=${excludeMode}&sortBy=${sortBy}&order=${order}`;

      if (include.length) {
        query = `${query}&include=${include.join(',')}`;
      }

      if (exclude.length) {
        query = `${query}&exclude=${exclude.join(',')}`;
      }

      if (name.length) {
        query = `${query}&name=${name}`;
      }

      if (author.length) {
        query = `${query}&author=${author}`;
      }

      if (pageParam) {
        query = `${query}&cursor=${pageParam}`;
      }

      const { data } = await axios.get(query);

      return data as { mangas: TData[]; lastCursor: number };
    },
    [author, exclude, excludeMode, include, includeMode, name, order, sortBy]
  );

  return useInfiniteQuery({
    queryKey: ['advanced-search-query'],
    queryFn: getMangas,
    getNextPageParam: (lastPage) => lastPage.lastCursor ?? false,
  });
};

export { useAdvancedSearch };
