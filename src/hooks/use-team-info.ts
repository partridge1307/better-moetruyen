import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMemo } from 'react';

const InfoEnum = {
  manga: 'manga',
};

type TInitialContent<TData> = {
  data: TData[];
  lastCursor?: number;
};

type TeamInfoProps<TData> = {
  teamId: number;
  initialContent: TInitialContent<TData>;
  type: keyof typeof InfoEnum;
};

export const useTeamInfo = <TData>({
  teamId,
  initialContent,
  type,
}: TeamInfoProps<TData>) => {
  const query = useInfiniteQuery<TInitialContent<TData>>({
    queryKey: ['team-info-infinite-query', teamId],
    queryFn: async ({ pageParam }) => {
      let query = `/api/team/${teamId}/${type}?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}`;

      if (!!pageParam && pageParam !== 0)
        query = `${query}&cursor=${pageParam}`;

      const { data } = await axios.get(query);

      return data as TInitialContent<TData>;
    },
    getNextPageParam: (lastPage) => lastPage.lastCursor ?? null,
    initialPageParam: 0,
  });

  const data = useMemo(() => {
    return (
      query.data?.pages.flatMap((page) => page.data) ?? initialContent.data
    );
  }, [initialContent.data, query.data?.pages]);

  return { data, query };
};
