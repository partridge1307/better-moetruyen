import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';

type notifyProps<TData> = {
  notifications: TData[];
  lastCursor: number | undefined;
};
const useNotify = <TData>() => {
  const [notifies, setNotifies] = useState<TData[]>([]);

  const query = useInfiniteQuery<notifyProps<TData>>({
    queryKey: ['infinite-notify-query'],
    queryFn: async ({ pageParam }) => {
      let query = `/api/notify?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}`;
      if (pageParam && pageParam !== 0) {
        query = `${query}&cursor=${pageParam}`;
      }

      const { data } = await axios.get(query);

      return data as notifyProps<TData>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.lastCursor ?? null,
    refetchInterval: 60000,
  });

  useEffect(() => {
    const notifies = query.data?.pages.flatMap((page) => page.notifications);

    if (notifies) {
      setNotifies(notifies);
    }
  }, [query.data?.pages]);

  return { notifies, setNotifies, ...query };
};

export { useNotify };
