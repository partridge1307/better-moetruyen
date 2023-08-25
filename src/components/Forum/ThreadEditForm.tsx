'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import {
  CreateThreadValidator,
  type CreateThreadPayload,
} from '@/lib/validators/forum';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SubForum } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Form } from '../ui/Form';
import ThreadCanSendField from './components/ThreadCanSendField';
import ThreadThumbnailField from './components/ThreadThumbnailField';
import ThreadTitleField from './components/ThreadTitleField';

interface ThreadEditFormProps {
  subForum: Pick<SubForum, 'id' | 'title' | 'banner' | 'canSend'>;
}

const ThreadEditForm: FC<ThreadEditFormProps> = ({ subForum }) => {
  const router = useRouter();
  const { loginToast, serverErrorToast, notFoundToast, successToast } =
    useCustomToast();

  const form = useForm<CreateThreadPayload>({
    resolver: zodResolver(CreateThreadValidator),
    defaultValues: {
      thumbnail: subForum.banner ?? '',
      title: subForum.title,
      canSend: subForum.canSend,
    },
  });

  const { mutate: Update, isLoading: isUpdating } = useMutation({
    mutationFn: async (values: CreateThreadPayload) => {
      const { thumbnail, title, canSend } = values;

      const form = new FormData();
      if (thumbnail?.startsWith('blob')) {
        const blob = await fetch(thumbnail).then((res) => res.blob());
        form.append('thumbnail', blob);
      }
      form.append('title', title);
      form.append('canSend', canSend ? 'true' : 'false');

      await axios.put(`/api/m/${subForum.id}`, form);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }
      return serverErrorToast();
    },
    onSuccess: (_, values) => {
      router.push(`/m/${values.title.split(' ').join('-')}`);
      router.refresh();

      return successToast();
    },
  });

  function onSubmitHandler(values: CreateThreadPayload) {
    Update(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitHandler)}
        className="p-2 space-y-10"
      >
        <ThreadThumbnailField form={form} />
        <ThreadTitleField form={form} />
        <ThreadCanSendField form={form} />

        <div className="flex justify-end gap-4">
          <Button
            tabIndex={0}
            type="button"
            disabled={isUpdating}
            variant={'destructive'}
            className="px-6"
            onClick={() => router.back()}
          >
            Hủy
          </Button>
          <Button
            tabIndex={1}
            disabled={isUpdating}
            isLoading={isUpdating}
            type="submit"
            className="px-6"
          >
            Sửa
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ThreadEditForm;
