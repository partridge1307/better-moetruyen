'use client';

import { CreatePostPayload, CreatePostValidator } from '@/lib/validators/forum';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/Form';
import dynamic from 'next/dynamic';
import { Button } from '../ui/Button';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useCustomToast } from '@/hooks/use-custom-toast';

const MoetruyenEditor = dynamic(
  () => import('@/components/Editor/MoetruyenEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-28 rounded-md animate-pulse dark:bg-zinc-900" />
    ),
  }
);

interface CreatePostFormProps {
  id: number;
}

const CreatePostForm: FC<CreatePostFormProps> = ({ id }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const form = useForm<CreatePostPayload>({
    resolver: zodResolver(CreatePostValidator),
    defaultValues: {
      title: '',
      content: undefined,
    },
  });

  const { mutate: Upload, isLoading: isUploading } = useMutation({
    mutationFn: async (values: CreatePostPayload) => {
      await axios.post(`/api/m/${id}`, values);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }
      return serverErrorToast();
    },
    onSuccess: () => {
      router.back();
      router.refresh();

      return successToast();
    },
  });

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function onSubmit(values: CreatePostPayload) {
    Upload(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề</FormLabel>
              <FormMessage />
              <FormControl>
                <TextareaAutosize
                  ref={(e) => {
                    field.ref(e);
                    // @ts-ignore
                    titleRef.current = e;
                  }}
                  placeholder="Tiêu đề"
                  className="resize-none text-lg w-full p-2 rounded-md bg-transparent"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
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
            tabIndex={0}
            disabled={isUploading}
            type="button"
            variant={'destructive'}
            onClick={() => router.back()}
          >
            Trở về
          </Button>
          <Button
            tabIndex={1}
            disabled={isUploading}
            isLoading={isUploading}
            type="submit"
            className="w-max px-6"
          >
            Đăng
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreatePostForm;
