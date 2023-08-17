'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { TagEditPayload, TagEditValidator } from '@/lib/validators/admin';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Tag } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/Form';
import { Input } from '../ui/Input';

interface TagModifierProps {
  tag?: Tag;
}

const TagModifier: FC<TagModifierProps> = ({ tag }) => {
  const router = useRouter();
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();

  const form = useForm<TagEditPayload>({
    resolver: zodResolver(TagEditValidator),
    defaultValues: {
      id: tag?.id ?? 0,
      name: tag?.name ?? '',
      description: tag?.description ?? '',
      category: tag?.category ?? '',
    },
  });

  const { mutate: Edit, isLoading: isEditting } = useMutation({
    mutationFn: async (values: TagEditPayload) => {
      const { id, name, description, category } = values;
      await axios.patch(`/api/admin/manga/tag`, {
        id,
        name,
        description,
        category,
      });
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

  const onSubmitHandler = (values: TagEditPayload) => {
    Edit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
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
          isLoading={isEditting}
          disabled={isEditting}
          className="w-full"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default TagModifier;
