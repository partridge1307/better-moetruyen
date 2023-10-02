import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { useIntersection } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

const useFollow = <TData>(
  initialData: {
    follows: TData[];
    lastCursor?: number;
  },
  type: 'team' | 'manga' | 'user'
) => {
  const ref = useRef<HTMLLinkElement>(null);
  const intersection = useIntersection({
    root: ref.current,
    threshold: 1,
  });
  const [follows, setFollows] = useState(initialData.follows);

  const query = useInfiniteQuery({
    queryKey: ['infinite-team-following-query'],
    queryFn: async ({ pageParam }) => {
      let query = `/api/user/follow${
        type === 'user' ? '' : `/${type}`
      }?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}`;

      if (pageParam) {
        query = `${query}&cursor=${pageParam}`;
      }

      const { data } = await axios.get(query);

      return data as { follows: TData[]; lastCursor: number };
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
