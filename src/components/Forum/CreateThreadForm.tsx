'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import {
  CreateThreadPayload,
  CreateThreadValidator,
} from '@/lib/validators/forum';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
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

const CreateThreadForm = () => {
  const { loginToast, serverErrorToast, successToast } = useCustomToast();
  const router = useRouter();

  const form = useForm<CreateThreadPayload>({
    resolver: zodResolver(CreateThreadValidator),
    defaultValues: {
      title: '',
    },
  });

  const { mutate: Create, isLoading: isCreating } = useMutation({
    mutationFn: async (values: CreateThreadPayload) => {
      const { data } = await axios.post('/api/m', values);

      return data as number;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 406)
          return toast({
            title: 'Đã tồn tại',
            description: 'Đã tồn tại SubMoeDit này rồi',
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
        className="p-2 space-y-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên cộng đồng</FormLabel>
              <FormControl>
                <div className="relative">
                  <p className="absolute left-2 w-8 inset-y-0 text-sm grid place-content-center">
                    m/
                  </p>
                  <Input className="pl-10" {...field} />
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            disabled={isCreating}
            isLoading={isCreating}
            variant={'destructive'}
            className="px-6"
            onClick={() => router.back()}
          >
            Hủy
          </Button>
          <Button
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
