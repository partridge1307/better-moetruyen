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
import { Select, SelectItem, SelectTrigger } from '@/components/ui/Select';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { AddBadgePayload, AddBadgeValidator } from '@/lib/validators/admin';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Badge } from '@prisma/client';
import { SelectContent, SelectValue } from '@radix-ui/react-select';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const BadgeModifier = ({
  badge,
}: {
  badge?: Pick<Badge, 'image' | 'name' | 'description' | 'color'>;
}) => {
  const { loginToast, notFoundToast } = useCustomToast();
  const [colorType, setColorType] = useState<'gradient' | 'normal'>('normal');
  const router = useRouter();

  const form = useForm<AddBadgePayload>({
    resolver: zodResolver(AddBadgeValidator),
    defaultValues: {
      image: badge?.image ?? '',
      name: badge?.name ?? '',
      description: badge?.description ?? '',
      color:
        (badge?.color as { color: string } | { from: string; to: string }) ??
        undefined,
    },
  });

  const { mutate: upload, isLoading: isUploading } = useMutation({
    mutationFn: async (values: AddBadgePayload) => {
      const { image, name, description, color } = values;

      const form = new FormData();
      const blob = await fetch(image).then((res) => res.blob());
      form.append('image', blob, blob.name);
      form.append('name', name);
      form.append('description', description);
      form.append('color', JSON.stringify(color));

      await axios.post('/api/admin/user/badge', form);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return toast({
        title: 'Có lỗi xảy ra',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.push('/manage/user/badge');
      router.refresh();

      return toast({
        title: 'Thành công',
      });
    },
  });

  const onSubmitHandler = (values: AddBadgePayload) => {
    if (!values.image.length)
      return form.setError('image', { type: 'custom', message: 'Phải có ảnh' });

    upload(values);
  };

  return (
    <div className="p-2 rounded-md dark:bg-zinc-900/70">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitHandler)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormMessage />
                <FormControl>
                  <Input
                    ref={field.ref}
                    type="file"
                    accept=".jpg, .png, .jpeg"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        const file = e.target.files[0];
                        const url = URL.createObjectURL(file);
                        field.onChange(url);
                      }
                    }}
                  />
                </FormControl>
                {!!field.value.length && (
                  <Image
                    width={100}
                    height={100}
                    src={field.value}
                    alt="Badge Icon"
                  />
                )}
              </FormItem>
            )}
          />

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
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormMessage />
                <Select
                  value={colorType}
                  onValueChange={(value) =>
                    setColorType(value as 'gradient' | 'normal')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent className="dark:bg-zinc-900">
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>

                <FormControl>
                  {colorType === 'normal' ? (
                    <Input
                      type="color"
                      value={form.getValues('color.color')}
                      onChange={(e) =>
                        field.onChange({ color: e.target.value })
                      }
                      onBlur={field.onBlur}
                    />
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <p>From</p>
                        <Input
                          type="color"
                          value={form.getValues('color.from')}
                          onChange={(e) =>
                            field.onChange({
                              from: e.target.value,
                              to: form.getValues('color.to'),
                            })
                          }
                          onBlur={field.onBlur}
                        />
                      </div>
                      <div>
                        <p>To</p>
                        <Input
                          type="color"
                          value={form.getValues('color.to')}
                          onChange={(e) =>
                            field.onChange({
                              from: form.getValues('color.from'),
                              to: e.target.value,
                            })
                          }
                          onBlur={field.onBlur}
                        />
                      </div>
                    </div>
                  )}
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            disabled={isUploading}
            isLoading={isUploading}
            className="w-full"
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default BadgeModifier;
