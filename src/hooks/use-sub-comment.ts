import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useCustomToast } from './use-custom-toast';

export const useSubComments = <TData>(id: number, APIQuery: string) => {
  const { serverErrorToast } = useCustomToast();

  return useQuery({
    queryKey: [`sub-comment-query`, id],
    queryFn: async () => {
      const { data } = await axios.get(`${APIQuery}/${id}/sub-comment`);

      return data as TData[];
    },
    onError: () => {
      return serverErrorToast();
    },
  });
};
