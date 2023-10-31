import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { useIntersection } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useCustomToast } from './use-custom-toast';

type followProps<TData> = {
  follows: TData[];
  lastCursor?: number;
};
const useFollow = <TData>(type: 'team' | 'manga') => {
  const { loginToast, notFoundToast, rateLimitToast, serverErrorToast } =
    useCustomToast();
  const ref = useRef<HTMLLinkElement>(null);
  const intersection = useIntersection({
    root: ref.current,
    threshold: 1,
  });
  const [follows, setFollows] = useState<TData[]>([]);

  const query = useInfiniteQuery<followProps<TData>>({
    queryKey: ['infinite-following-query', type],
    queryFn: async ({ pageParam }) => {
      let query = `/api/user/follow/${type}?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}`;
      if (pageParam && pageParam !== 0) {
        query = `${query}&cursor=${pageParam}`;
      }

      const { data } = await axios.get(query);

      return data as followProps<TData>;
    },
    getNextPageParam: (lastPage) => lastPage.lastCursor ?? null,
    initialPageParam: 0,
  });

  useEffect(() => {
    if (query.error) {
      if (query.error instanceof AxiosError) {
        if (query.error.response?.status === 401) {
          loginToast();
          return;
        }
        if (query.error.response?.status === 404) {
          notFoundToast();
          return;
        }
        if (query.error.response?.status === 429) {
          rateLimitToast();
          return;
        }
      }

      serverErrorToast();
    }
  }, [
    loginToast,
    notFoundToast,
    query.error,
    rateLimitToast,
    serverErrorToast,
  ]);

  useEffect(() => {
    const follows = query.data?.pages.flatMap((page) => page.follows) ?? [];

    setFollows(follows);
  }, [query.data?.pages]);

  return { ...intersection, follows, ...query };
};

export { useFollow };
