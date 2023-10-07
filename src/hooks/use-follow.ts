import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { useIntersection } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useCustomToast } from './use-custom-toast';

const useFollow = <TData>(
  initialData: {
    follows: TData[];
    lastCursor?: number;
  },
  type: 'team' | 'manga'
) => {
  const { loginToast, notFoundToast, rateLimitToast, serverErrorToast } =
    useCustomToast();
  const ref = useRef<HTMLLinkElement>(null);
  const intersection = useIntersection({
    root: ref.current,
    threshold: 1,
  });
  const [follows, setFollows] = useState(initialData.follows);

  const query = useInfiniteQuery({
    queryKey: ['infinite-team-following-query'],
    queryFn: async ({ pageParam }) => {
      let query = `/api/user/follow/${type}?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}`;

      if (pageParam) {
        query = `${query}&cursor=${pageParam}`;
      }

      const { data } = await axios.get(query);

      return data as { follows: TData[]; lastCursor: number };
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 429) return rateLimitToast();
      }

      return serverErrorToast();
    },
    getNextPageParam: (lastPage) => lastPage.lastCursor ?? false,
    initialData: {
      pages: [initialData],
      pageParams: [initialData.lastCursor],
    },
  });

  useEffect(() => {
    const follows =
      query.data?.pages.flatMap((page) => page.follows) ?? initialData.follows;

    setFollows(follows);
  }, [initialData.follows, query.data?.pages]);

  return { ...intersection, follows, ...query };
};

export { useFollow };
