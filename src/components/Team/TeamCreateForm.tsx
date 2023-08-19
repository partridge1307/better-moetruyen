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
import { TeamCreatePayload, TeamCreateValidator } from '@/lib/validators/team';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const TeamCreateForm = () => {
  const router = useRouter();
  const [imageStr, setImageStr] = useState<string>('');
  const { loginToast, serverErrorToast, successToast } = useCustomToast();

  const form = useForm<TeamCreatePayload>({
    resolver: zodResolver(TeamCreateValidator),
    defaultValues: {
      image: undefined,
      name: '',
      description: '',
    },
  });

  const { mutate: Create, isLoading: isCreating } = useMutation({
    mutationFn: async (values: TeamCreatePayload) => {
      const { image, name, description } = values;

      const form = new FormData();
      form.append('image', image);
      form.append('name', name);
      form.append('description', description);

      await axios.post(`/api/team`, form);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 400)
          return toast({
            title: 'Trùng lặp Team',
            description:
              'Có vẻ như Team đã bị tạo trước đó rồi. Vui lòng tạo team khác',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push('/me/team');
      router.refresh();

      return successToast();
    },
  });

  function onSubmitHandler(values: TeamCreatePayload) {
    Create(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ảnh</FormLabel>
              <FormMessage />
              <FormControl>
                {imageStr.length ? (
                  <Image
                    width={0}
                    height={0}
                    sizes="100vw"
                    src={imageStr}
                    alt="Team Image Preview"
                    className="w-32 h-44 object-cover rounded-md cursor-pointer"
                    onClick={() => {
                      const target = document.getElementById(
                        'team-image-add'
                      ) as HTMLInputElement;

                      target.click();
                    }}
                  />
                ) : (
                  <div
                    role="button"
                    className="w-32 h-44 flex justify-center items-center border-2 border-dashed rounded-md"
                    onClick={() => {
                      const target = document.getElementById(
                        'team-image-add'
                      ) as HTMLInputElement;

                      target.click();
                    }}
                  >
                    <ImageIcon className="w-8 h-8 opacity-50" />
                  </div>
                )}
              </FormControl>
              <Input
                id="team-image-add"
                type="file"
                accept=".jpg, .png, .jpeg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    field.onChange(e.target.files[0]);
                    const url = URL.createObjectURL(e.target.files[0]);
                    setImageStr(url);
                    e.target.value = '';
                  }
                }}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên Team</FormLabel>
              <FormMessage />
              <FormControl>
                <Input placeholder="Tên Team" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormMessage />
              <FormControl>
                <Input placeholder="Mô tả" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          isLoading={isCreating}
          disabled={isCreating}
          type="submit"
          className="w-full"
        >
          Tạo
        </Button>
      </form>
    </Form>
  );
};

export default TeamCreateForm;
