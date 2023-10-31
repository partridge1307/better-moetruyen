import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

type commentProps<TData> = {
  comments: TData[];
  lastCursor: number | undefined;
};
export const useComments = <TData>(id: number, APIQuery: string) =>
  useInfiniteQuery<commentProps<TData>>({
    queryKey: ['infinite-comments-query', id],
    queryFn: async ({ pageParam }) => {
      let query = `${APIQuery}?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}`;
      if (pageParam && pageParam !== 0) {
        query = `${query}&cursor=${pageParam}`;
      }

      const { data } = await axios.get(query);

      return data as commentProps<TData>;
    },
    getNextPageParam: (lastPage) => lastPage.lastCursor ?? null,
    initialPageParam: 0,
  });
