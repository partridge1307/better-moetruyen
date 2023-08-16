'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const Page = () => {
  const { loginToast, notFoundToast } = useCustomToast();
  const [userInput, setUserInput] = useState('');
  const [debounced] = useDebouncedValue(userInput, 300);
  const [userId, setUserId] = useState('');

  const {
    data: fetchUserData,
    mutate: fetchUser,
    isLoading: isFetchingUser,
  } = useMutation({
    mutationKey: ['manage-fetch-user'],
    mutationFn: async (name: string) => {
      const { data } = await axios.get(`/api/admin/user?q=${name}`);

      return data as {
        id: string;
        name: string;
        isBanned: boolean;
        muteExpires: Date | null;
      }[];
    },
  });

  useEffect(() => {
    if (debounced.length) {
      fetchUser(debounced);
    }
  }, [debounced, fetchUser]);

  const { mutate: submit, isLoading: isSubmitting } = useMutation({
    mutationKey: ['mute-user-submit'],
    mutationFn: async (id: string) => {
      await axios.patch(`/api/admin/user/ban`, { id });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 400)
          return toast({
            title: 'User đã bị ban trước đó rồi',
            variant: 'destructive',
          });
      }
      return toast({
        title: 'Có lỗi xảy ra',
        description: 'Có lỗi xảy ra. Vui lòng thử lại sau',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      location.reload();
      return toast({ title: 'Thành công' });
    },
  });

  return (
    <div className="p-2 space-y-2 rounded-md dark:bg-zinc-900">
      <Label htmlFor="username-input">Username</Label>
      <Input
        id="username-input"
        placeholder="userName"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
      />
      {isFetchingUser && <Loader2 className="w-6 h-6 animate-spin" />}
      <ul className="flex flex-wrap gap-4 max-h-96 overflow-auto">
        {!isFetchingUser &&
          !!fetchUserData?.length &&
          fetchUserData.map((user, idx) => (
            <li
              key={idx}
              className={cn(
                'p-2 rounded-md hover:cursor-pointer dark:bg-zinc-800',
                { 'dark:bg-green-700': userInput === user.name }
              )}
              onClick={() => {
                setUserInput(user.name);
                setUserId(user.id);
              }}
            >
              <p>
                <span>ID:</span> {user.id}
              </p>
              <p>
                <span>Name:</span> {user.name}
              </p>
              <p>
                <span>Ban:</span> {user.isBanned ? 'true' : 'false'}
              </p>
              <p>
                <span>MutedTo:</span>{' '}
                {!!user.muteExpires
                  ? `${new Date(user.muteExpires).getDate()}-${new Date(
                      user.muteExpires
                    ).getMonth()}-${new Date(user.muteExpires).getFullYear()}`
                  : 'false'}
              </p>
            </li>
          ))}
      </ul>

      <Button
        disabled={!userId.length || isSubmitting}
        className="w-full"
        onClick={() => submit(userId)}
      >
        Submit
      </Button>
    </div>
  );
};

export default Page;
