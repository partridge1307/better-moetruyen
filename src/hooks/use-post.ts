import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

export const usePosts = <TData>(
  APIQuery: string,
  initialPosts: TData[],
  sortBy: 'asc' | 'desc' | 'hot',
  id?: number
) =>
  useInfiniteQuery(
    ['post-infinite-query', id],
    async ({ pageParam = 1 }) => {
      let query;

      if (id) {
        query = `${APIQuery}/${id}?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}&sortBy=${sortBy}`;
      } else {
        query = `${APIQuery}?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}&sortBy=${sortBy}`;
      }

      const { data } = await axios.get(query);
      return data as TData[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: {
        pages: [initialPosts],
        pageParams: [1],
      },
    }
  );
