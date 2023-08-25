'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import {
  CreateThreadValidator,
  type CreateThreadPayload,
} from '@/lib/validators/forum';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Form } from '../ui/Form';
import ThreadCanSendField from './components/ThreadCanSendField';
import ThreadThumbnailField from './components/ThreadThumbnailField';
import ThreadTitleField from './components/ThreadTitleField';

const CreateThreadForm = () => {
  const { loginToast, serverErrorToast, successToast, verifyToast } =
    useCustomToast();
  const router = useRouter();

  const form = useForm<CreateThreadPayload>({
    resolver: zodResolver(CreateThreadValidator),
    defaultValues: {
      thumbnail: '',
      title: '',
      canSend: true,
    },
  });

  const { mutate: Create, isLoading: isCreating } = useMutation({
    mutationFn: async (values: CreateThreadPayload) => {
      const { thumbnail, title, canSend } = values;

      const form = new FormData();

      if (thumbnail) {
        const blob = await fetch(thumbnail).then((res) => res.blob());
        form.append('thumbnail', blob);
      }

      form.append('title', title);
      form.append('canSend', canSend ? 'true' : 'false');

      const { data } = await axios.post('/api/m', form);

      return data as number;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return verifyToast();
        if (err.response?.status === 406)
          return toast({
            title: 'Đã tồn tại',
            description: 'Đã tồn tại cộng đồng này rồi',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: (data) => {
      router.push(`/m/${data}`);

      return successToast();
    },
  });

  function onSubmitHandler(values: CreateThreadPayload) {
    Create(values);
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
            disabled={isCreating}
            variant={'destructive'}
            className="px-6"
            onClick={() => router.back()}
          >
            Hủy
          </Button>
          <Button
            tabIndex={1}
            disabled={isCreating}
            isLoading={isCreating}
            type="submit"
            className="px-6"
          >
            Tạo
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateThreadForm;
