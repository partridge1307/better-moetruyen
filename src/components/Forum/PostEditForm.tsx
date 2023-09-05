'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { CreatePostPayload, CreatePostValidator } from '@/lib/validators/forum';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Post, SubForum } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '../ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/Form';

const MoetruyenEditor = dynamic(
  () => import('@/components/Editor/MoetruyenEditor'),
  { ssr: false }
);

interface PostEditFormProps {
  post: Pick<Post, 'id' | 'content' | 'title'> & {
    subForum: Pick<SubForum, 'slug'>;
  };
}

const PostEditForm: FC<PostEditFormProps> = ({ post }) => {
  const router = useRouter();
  const { serverErrorToast, loginToast, notFoundToast, successToast } =
    useCustomToast();

  const { mutate: Update, isLoading: isUpdating } = useMutation({
    mutationFn: async (values: CreatePostPayload) => {
      await axios.patch(`/api/m/${post.id}`, values);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push(`/m/${post.subForum.slug}/${post.id}}`);
      router.refresh();

      return successToast();
    },
  });

  const form = useForm<CreatePostPayload>({
    resolver: zodResolver(CreatePostValidator),
    defaultValues: {
      title: post.title,
      content: undefined,
    },
  });

  function onSubmitHandler(values: CreatePostPayload) {
    const payload: CreatePostPayload = {
      title: values.title,
      content: values.content ?? post.content,
    };

    Update(payload);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitHandler)}
        className="space-y-10"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề</FormLabel>
              <FormMessage />
              <FormControl>
                <TextareaAutosize
                  placeholder="Tiêu đề"
                  className="resize-none text-lg w-full p-2 rounded-md bg-transparent"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung</FormLabel>
              <FormMessage />
              <FormControl>
                <MoetruyenEditor
                  placeholder="Nhập nội dung"
                  initialContent={post.content}
                  onChange={(editorState) =>
                    field.onChange(editorState.toJSON())
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end items-center gap-6">
          <Button
            type="button"
            disabled={isUpdating}
            variant={'destructive'}
            onClick={() => router.back()}
          >
            Trở về
          </Button>
          <Button
            type="submit"
            isLoading={isUpdating}
            disabled={isUpdating}
            className="w-max px-6"
          >
            Sửa
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostEditForm;
