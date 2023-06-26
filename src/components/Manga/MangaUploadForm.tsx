'use client';

import {
  CreateMangaUploadPayload,
  MangaUploadValidator,
} from '@/lib/validators/upload';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import MangaTagModal from './MangaTagModal';
import { Button } from '@/components/ui/Button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/TextArea';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Tag } from '@prisma/client';

interface MangaUploadFormProps {
  tag: Array<Tag>;
}

const MangaUploadForm: FC<MangaUploadFormProps> = ({ tag }) => {
  const { loginToast } = useCustomToast();
  const { toast } = useToast();
  const { refresh } = useRouter();
  const form = useForm<CreateMangaUploadPayload>({
    resolver: zodResolver(MangaUploadValidator),
    defaultValues: {
      image: undefined,
      name: '',
      description: '',
      author: '',
      tag: [],
    },
  });
  const { mutate: Upload, isLoading } = useMutation({
    mutationFn: async ({
      blobImage,
      values,
    }: {
      blobImage: Blob;
      values: object;
    }) => {
      const {
        // eslint-disable-next-line no-unused-vars
        image,
        tag: tagForm,
        ...mangaBody
      } = MangaUploadValidator.parse(values);

      // Filter tag to get id
      const tagFilter = tag.filter((t) =>
        tagForm.includes(t.name.toLowerCase())
      );

      // Append submitted values to form
      const form = new FormData();
      form.append('file', blobImage);
      tagFilter.map((v) => form.append('tag', `${v.id}`));
      for (const [key, value] of Object.entries(mangaBody)) {
        form.append(`${key}`, value);
      }

      const { data } = await axios.post('/api/manga/upload', form);

      return data as string;
    },
    onError: (e) => {
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: 'Có lỗi xảy ra',
        description: 'Vui lòng thử lại sau',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Bạn đã upload truyện thành công',
      });

      startTransition(() => refresh());
    },
  });

  const onSubmit = (values: CreateMangaUploadPayload) => {
    const blobImage = new Blob([values.image], { type: 'image' });

    Upload({ blobImage, values });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ảnh bìa</FormLabel>
              <FormMessage />
              <FormControl>
                <Input
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  className="file:bg-white file:rounded-md"
                  onChange={(e) => {
                    if (e.target.files) {
                      field.onChange(e.target.files[0]);
                    }
                  }}
                />
              </FormControl>
              <FormDescription>Ảnh bìa truyện bạn muốn upload</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên truyện</FormLabel>
              <FormMessage />
              <FormControl>
                <Input placeholder="Tên truyện" {...field} />
              </FormControl>
              <FormDescription>Tên truyện bạn muốn upload</FormDescription>
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
                <Textarea
                  placeholder="Mô tả"
                  rows={5}
                  {...field}
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>
                Hãy mô tả truyện bạn muốn upload
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tác giả</FormLabel>
              <FormMessage />
              <FormControl>
                <Input placeholder="Tác giả" {...field} />
              </FormControl>
              <FormDescription>
                Tên tác giả của bộ bạn muốn upload
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tag"
          render={() => <MangaTagModal tag={tag} form={form} />}
        />

        <Button type="submit" isLoading={isLoading}>
          Upload
        </Button>
      </form>
    </Form>
  );
};

export default MangaUploadForm;
