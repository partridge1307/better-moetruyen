'use client';

import { Button } from '@/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MutePayload, MuteValidator } from '@/lib/validators/admin';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebouncedValue } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const Page = () => {
  const { loginToast, notFoundToast } = useCustomToast();
  const [userInput, setUserInput] = useState('');
  const [debounced] = useDebouncedValue(userInput, 300);

  const form = useForm<MutePayload>({
    resolver: zodResolver(MuteValidator),
    defaultValues: {
      id: '',
      name: '',
      expiredAt: undefined,
    },
  });

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
    mutationFn: async (values: MutePayload) => {
      const { id, name, expiredAt } = values;

      await axios.patch(`/api/admin/user/mute`, { id, name, expiredAt });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 400)
          return toast({
            title: 'User đã bị mute trước đó rồi',
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

  const onSubmitHandler = (values: MutePayload) => {
    submit(values);
  };

  return (
    <div className="p-2 rounded-md dark:bg-zinc-900">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitHandler)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormMessage />
                <FormControl>
                  <Input
                    ref={field.ref}
                    placeholder="Username"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onBlur={field.onBlur}
                  />
                </FormControl>
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
                          form.setValue('id', user.id);
                          form.setValue('name', user.name);
                        }}
                      >
                        <p>
                          <span>ID:</span> {user.id}
                        </p>
                        <p>
                          <span>Name:</span> {user.name}
                        </p>
                        <p>
                          <span>MutedTo:</span>{' '}
                          {!!user.muteExpires
                            ? `${new Date(
                                user.muteExpires
                              ).getDate()}-${new Date(
                                user.muteExpires
                              ).getMonth()}-${new Date(
                                user.muteExpires
                              ).getFullYear()}`
                            : 'false'}
                        </p>
                      </li>
                    ))}
                </ul>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiredAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expire to</FormLabel>
                <FormMessage />
                <FormControl>
                  <Input
                    ref={field.ref}
                    type="date"
                    onChange={(e) => field.onChange(e.target.valueAsDate)}
                    onBlur={field.onBlur}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            isLoading={isSubmitting}
            disabled={isSubmitting}
            type="submit"
            className="w-full"
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Page;
