import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useEffect, useMemo } from 'react';
import { useCustomToast } from './use-custom-toast';

export const UserInfoEnum = {
  MANGA: 'manga',
  FORUM: 'forum',
  FOLLOW_BY: 'follow-by',
  FOLLOWING: 'following',
} as const;

type ObjectValues<T> = T[keyof T];

type InitialData<TData> = {
  data: TData[];
  lastCursor?: number | string;
};

type UserInfoProps<TData> = {
  userId: string;
  type: ObjectValues<typeof UserInfoEnum>;
  initialData: InitialData<TData>;
};

export const useUserInfo = <TData>({
  userId,
  type,
  initialData,
}: UserInfoProps<TData>) => {
  const { notFoundToast, rateLimitToast, serverErrorToast } = useCustomToast();

  const query = useInfiniteQuery<InitialData<TData>>({
    queryKey: ['user-info-infinite-query', userId, type],
    queryFn: async ({ pageParam }) => {
      let query = `/api/user/info/${userId}/${type}?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}`;

      if (!!pageParam && pageParam !== 0) {
        query = `${query}&cursor=${pageParam}`;
      }

      const { data } = await axios.get(query);

      return data as InitialData<TData>;
    },
    getNextPageParam: (lastPage) => lastPage.lastCursor ?? null,
    initialPageParam: 0,
    retry: 2,
  });

  useEffect(() => {
    if (!!query.error) {
      const error = query.error;

      if (error instanceof AxiosError) {
        if (error.response?.status === 404) notFoundToast();
        else if (error.response?.status === 429) rateLimitToast();
        else serverErrorToast();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.error]);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data) ?? initialData.data;
  }, [initialData.data, query.data?.pages]);

  return { data, query };
};
