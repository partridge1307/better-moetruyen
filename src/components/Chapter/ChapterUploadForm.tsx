'use client';

import {
  ChapterUploadValidator,
  CreateChapterUploadPayload,
} from '@/lib/validators/upload';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Progress } from '@/components/ui/Progress';
import { useToast } from '@/hooks/use-toast';
import { useCustomToast } from '@/hooks/use-custom-toast';

interface ChapterUploadFormProps {
  mangaId: string;
}

const ChapterUploadForm: FC<ChapterUploadFormProps> = ({ mangaId }) => {
  const { toast } = useToast();
  const { loginToast } = useCustomToast();
  const form = useForm<CreateChapterUploadPayload>({
    resolver: zodResolver(ChapterUploadValidator),
    defaultValues: {
      chapterIndex: 0,
      chapterName: '',
      image: undefined,
    },
  });
  const [previewImage, setImage] = useState<Array<string>>([]);
  const [progress, setProgress] = useState<number>(0);
  const { mutate: Upload, isLoading } = useMutation({
    mutationFn: async ({
      BlobImages,
      values,
    }: {
      BlobImages: Array<Blob>;
      values: CreateChapterUploadPayload;
    }) => {
      const imagesURL = await Promise.all(
        BlobImages.map(async (BlobImg, i) => {
          const form = new FormData();
          form.append('file', BlobImg);
          const { data, status } = await axios.post('/api/image', form);
          if (status === 201) {
            setProgress(Math.floor((i / BlobImages.length) * 100));
            return data;
          }
        })
      );
      const { chapterIndex, chapterName } =
        ChapterUploadValidator.parse(values);

      const { data } = await axios.post(`/api/manga/${mangaId}/chapter`, {
        chapterIndex,
        name: chapterName,
        images: imagesURL,
      });

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
        description: 'Có lỗi xảy ra. Vui lòng thử lại',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      return toast({
        title: 'Thành công',
        description: 'Đã hoàn tất upload chapter',
      });
    },
  });

  const onSubmit = (values: CreateChapterUploadPayload) => {
    let BlobImages: Array<Blob> = [];
    for (let i = 0; i < values.image.length; i++) {
      BlobImages.push(new Blob([values.image.item(i)!], { type: 'image' }));
    }

    Upload({ BlobImages, values });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {isLoading && <Progress value={progress} />}
        <FormField
          control={form.control}
          name="chapterIndex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>STT chapter</FormLabel>
              <FormMessage />
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormDescription>Thứ tự của chapter</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="chapterName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên chapter</FormLabel>
              <FormMessage />
              <FormControl>
                <Input placeholder="Tên chapter" {...field} />
              </FormControl>
              <FormDescription>Tên của chapter</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên chapter</FormLabel>
              <FormMessage />
              <FormControl>
                <Input
                  multiple
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  onChange={(e) => {
                    if (e.target.files) {
                      field.onChange(e.target.files);
                      let imagesURLs = [];
                      for (let i = 0; i < e.target.files.length; i++) {
                        imagesURLs.push(URL.createObjectURL(e.target.files[i]));
                      }
                      setImage([...imagesURLs]);
                    }
                  }}
                  className="file:bg-slate-50 file:rounded-md"
                />
              </FormControl>
              <FormDescription>Tên của chapter</FormDescription>
              <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {previewImage &&
                  previewImage.map((img) => (
                    <li key={img} className="relative h-32  w-full">
                      <Image
                        fill
                        src={img}
                        alt="Preview image chapter"
                        style={{ objectFit: 'cover' }}
                      />
                    </li>
                  ))}
              </ul>
            </FormItem>
          )}
        />
        <Button type="submit" isLoading={isLoading}>
          Upload
        </Button>
      </form>
    </Form>
  );
};

export default ChapterUploadForm;
