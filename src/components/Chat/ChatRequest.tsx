import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { useDebouncedValue } from '@mantine/hooks';
import type { User } from '@prisma/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { FC, useEffect, useState } from 'react';
import Username from '../User/Username';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/Command';
import { useRouter } from 'next/navigation';

interface ChatRequestProps {}

const ChatRequest: FC<ChatRequestProps> = ({}) => {
  const { loginToast, notFoundToast } = useCustomToast();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debounced] = useDebouncedValue(query, 300);

  const {
    data: results,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      if (!query) return [];

      const { data } = await axios.get(`/api/user/search?query=${query}`);

      return data as Pick<User, 'id' | 'name' | 'color'>[];
    },
    queryKey: ['user-search-query'],
    enabled: false,
  });

  const { mutate: createConversation, isLoading } = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.post(`/api/user/conversation/${id}`);

      return data as number;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 406)
          return toast({
            title: 'Đã tồn tại',
            description: 'Bạn đã tạo hội thoại với người dùng này rồi.',
            variant: 'destructive',
          });
      }

      return toast({
        title: 'Có lỗi xảy ra',
        description: 'Có lỗi xảy ra. Vui lòng thử lại sau',
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      router.push(`/chat?id=${data}`);
      router.refresh();

      return toast({
        title: 'Thành công',
      });
    },
  });

  useEffect(() => {
    refetch();
  }, [refetch, debounced]);

  return (
    <Command>
      <CommandInput
        value={query}
        onValueChange={(query) => setQuery(query)}
        placeholder="Moe..."
      />

      {query.length > 0 ? (
        <CommandList>
          {isFetched && <CommandEmpty>Không tìm thấy</CommandEmpty>}
          {isFetching && (
            <div className="p-2">
              <template className="w-full h-4 rounded-full dark:bg-zinc-800" />
            </div>
          )}
          {(results?.length ?? 0) > 0 ? (
            <CommandGroup>
              {results?.map((result, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => createConversation(result.id)}
                  value={result.name!}
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  <Username user={result} />
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      ) : null}
    </Command>
  );
};

export default ChatRequest;
