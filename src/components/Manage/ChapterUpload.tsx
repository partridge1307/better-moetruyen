'use client';

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';

type previewImage = {
  link: string;
  name: string;
  type: string;
  size: number;
  progress?: number | null;
  done?: boolean;
};

const ChapterUpload = ({ id }: { id: string }) => {
  const { loginToast } = useCustomToast();
  const form = useForm<ChapterUploadPayload>({
    resolver: zodResolver(ChapterUploadValidator),
    defaultValues: {
      chapterIndex: 0,
      chapterName: '',
      volume: 0,
      image: undefined,
    },
  });

  const [inputImage, setInputImage] = useState<previewImage[]>([]);
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
      return toast({
        title: 'Thành công',
      });
    },
  });

  const [disaleChapterIndex, setDisableChapterIndex] = useState<boolean>(true);

  const onSubmitHandler = (values: ChapterUploadPayload) => {
    upload(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <FormField
          control={form.control}
          name="chapterIndex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>STT chapter</FormLabel>
              <FormMessage />
              <FormControl>
                <div>
                  <Select
                    onValueChange={(value) => {
                      if (value === 'custom') setDisableChapterIndex(false);
                      else if (value === 'append') {
                        field.onChange(0);
                        setDisableChapterIndex(true);
                      }
                    }}
                    defaultValue="append"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="append">
                          Sau chapter mới nhất
                        </SelectItem>
                        <SelectItem value="custom">Tự điền</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Input
                    ref={field.ref}
                    disabled={disaleChapterIndex}
                    type="number"
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    onBlur={field.onBlur}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
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

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ảnh</FormLabel>
              <FormMessage />
              <FormControl>
                <Input
                  ref={field.ref}
                  type="file"
                  multiple
                  accept=".jpg, .png, .jpeg"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      field.onChange(e.target.files);
                      let imageObject = [];
                      for (let i = 0; i < e.target.files.length; i++) {
                        imageObject.push({
                          link: URL.createObjectURL(e.target.files.item(i)!),
                          name: e.target.files.item(i)!.name.split('.')[0],
                          type: e.target.files.item(i)!.name.split('.')[1],
                          size: Math.floor(e.target.files.item(i)!.size / 1000),
                        });
                      }
                      setInputImage(imageObject);
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <ul className="w-full max-h-[300px] overflow-y-auto flex flex-col gap-4 scrollbar dark:scrollbar--dark">
          {inputImage.length &&
            inputImage.map((img, i) => (
              <li
                key={i}
                className="relative flex items-center gap-10 bg-slate-300 dark:bg-zinc-800 p-2 rounded-md"
              >
                <div className="relative h-12 w-12">
                  <Image
                    fill
                    src={img.link}
                    alt="Preview Image"
                    className="object-cover"
                  />
                </div>
                <div className="flex justify-between w-full items-center text-sm">
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
