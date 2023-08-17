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
import { TagEditPayload, TagEditValidator } from '@/lib/validators/admin';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

const Page = () => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const router = useRouter();

  const form = useForm<TagEditPayload>({
    resolver: zodResolver(TagEditValidator),
    defaultValues: {
      id: 0,
      name: '',
      description: '',
      category: '',
    },
  });

  const { mutate: Add, isLoading: isAdding } = useMutation({
    mutationFn: async (values: TagEditPayload) => {
      await axios.post('/api/admin/manga/tag', values);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }
      return serverErrorToast();
    },
    onSuccess: () => {
      router.push('/manage/manga/tag');
      router.refresh();

      return successToast();
    },
  });

  function onSubmitHandler(values: TagEditPayload) {
    Add(values);
  }

  return (
    <div className="p-2 rounded-md dark:bg-zinc-900/70">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitHandler)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormMessage />
                <FormControl>
                  <Input placeholder="Name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormMessage />
                <FormControl>
                  <Input placeholder="Description" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormMessage />
                <FormControl>
                  <Input placeholder="Category" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            isLoading={isAdding}
            disabled={isAdding}
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
