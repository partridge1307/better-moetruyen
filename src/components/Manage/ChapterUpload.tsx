'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import {
  ChapterUploadValidator,
  type ChapterUploadPayload,
} from '@/lib/validators/upload';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Image from 'next/image';
import { useState } from 'react';
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
import { Progress } from '../ui/Progress';
import ChapterImageUpload, { type previewImage } from './ChapterImageUpload';
import ChapterIndexUpload from './ChapterIndexUpload';
import { useRouter } from 'next/navigation';

const ChapterUpload = ({ id }: { id: string }) => {
  const { loginToast, notFoundToast } = useCustomToast();
  const router = useRouter();
  const [inputImage, setInputImage] = useState<previewImage[]>([]);
  const [disaleChapterIndex, setDisableChapterIndex] = useState<boolean>(true);

  const form = useForm<ChapterUploadPayload>({
    resolver: zodResolver(ChapterUploadValidator),
    defaultValues: {
      chapterIndex: 0,
      chapterName: '',
      volume: 0,
      image: undefined,
    },
  });
  const imgUpload = (image: FileList) =>
    new Promise((resolve) => {
      let imageURL: any = [];
      for (let i = 0; i < image.length; i++) {
        const form = new FormData();
        form.append('file', image.item(i)!);
        axios
          .post('/api/image', form, {
            onUploadProgress: (progessEvent) => {
              const percentCompleted = Math.floor(
                (progessEvent.loaded * 100) / progessEvent.total!
              );
              inputImage[i].progress = percentCompleted;
              setInputImage([inputImage[i], ...inputImage]);
            },
          })
          .then((res) => {
            imageURL.push(res.data);
            inputImage[i].done = true;
            setInputImage([inputImage[i], ...inputImage]);
            if (i === image.length - 1) resolve(imageURL);
          });
      }
    });
  const { mutate: upload, isLoading: isImageUpload } = useMutation({
    mutationFn: async (values: ChapterUploadPayload) => {
      const { image, ...payload } = ChapterUploadValidator.parse(values);

      const imageURL = await imgUpload(image);
      const { data } = await axios.post(`/api/manga/${id}/chapter`, {
        images: imageURL,
        ...payload,
      });
      return data as string;
    },
    onError: (e) => {
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) return loginToast();
        if (e.response?.status === 404) return notFoundToast();
        if (e.response?.status === 403)
          return toast({
            title: 'Trùng lặp STT',
            description:
              'Đã có chapter trùng lặp STT này rồi. Vui lòng thử lại',
            variant: 'destructive',
          });
      }

      return toast({
        title: 'Có lỗi xảy ra',
        description: 'Vui lòng thử lại',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.push(`/me/manga/${id}/chapter`);
      router.refresh();

      return toast({
        title: 'Thành công',
      });
    },
  });

  const onSubmitHandler = (values: ChapterUploadPayload) => {
    upload(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <ChapterIndexUpload
          form={form}
          setDisableChapterIndex={(value) => setDisableChapterIndex(value)}
          disaleChapterIndex={disaleChapterIndex}
        />

        <FormField
          control={form.control}
          name="chapterName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên chap</FormLabel>
              <FormMessage />
              <FormControl>
                <Input placeholder="Tên chapter" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="volume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volume</FormLabel>
              <FormMessage />
              <FormControl>
                <Input
                  type="number"
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  onBlur={field.onBlur}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <ChapterImageUpload
          form={form}
          setInputImage={(value) => setInputImage(value)}
        />

        <ul className="scrollbar dark:scrollbar--dark flex max-h-[300px] w-full flex-col gap-4 overflow-y-auto">
          {inputImage.length &&
            inputImage.map((img, i) => (
              <li
                key={i}
                className="relative flex items-center gap-10 rounded-md bg-slate-300 p-2 dark:bg-zinc-800"
              >
                <div className="relative h-12 w-12">
                  <Image
                    fill
                    src={img.link}
                    alt="Preview Image"
                    className="object-cover"
                  />
                </div>
                <div className="flex w-full items-center justify-between text-sm">
                  <div>
                    <p>Tên: {img.name}</p>
                    <p>Định dạng: {img.type}</p>
                  </div>
                  <p>Kích cỡ: {img.size}KB</p>
                </div>
                {img.progress && (
                  <Progress
                    value={img.progress}
                    className="w-1/2"
                    indicatorClassName={`${img.done && 'bg-green-500'}`}
                  />
                )}
              </li>
            ))}
        </ul>

        <Button
          type="submit"
          isLoading={isImageUpload}
          disabled={isImageUpload}
          className="w-full"
        >
          Đăng
        </Button>
      </form>
    </Form>
  );
};

export default ChapterUpload;
