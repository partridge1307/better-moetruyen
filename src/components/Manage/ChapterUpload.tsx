'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import {
  ChapterUploadValidator,
  type ChapterUploadPayload,
} from '@/lib/validators/upload';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { ImagePlus, PlusCircle, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import DnDChapterImage from '../DragAndDrop';
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
import ChapterIndexUpload from './ChapterIndexUpload';

const ChapterUpload = ({ id }: { id: string }) => {
  const { loginToast, notFoundToast } = useCustomToast();
  const router = useRouter();
  const [disaleChapterIndex, setDisableChapterIndex] = useState<boolean>(true);
  const [images, setImages] = useState<
    { src: string; name: string; progress?: number }[]
  >([]);

  const form = useForm<ChapterUploadPayload>({
    resolver: zodResolver(ChapterUploadValidator),
    defaultValues: {
      chapterIndex: 0,
      chapterName: '',
      volume: 0,
      image: undefined,
    },
  });

  const imgUpload = (): Promise<string[]> =>
    new Promise(async (resolve) => {
      let imagePromise: Promise<AxiosResponse>[] = [];

      await Promise.all(
        images.map(async (img, index) => {
          const blob = await fetch(img.src).then((res) => res.blob());
          const form = new FormData();
          form.append('file', blob);
          imagePromise.push(
            axios.post('/api/image', form, {
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.floor(
                  (progressEvent.loaded * 100) / progressEvent.total!
                );
                images[index].progress = percentCompleted;
                setImages([...images]);
              },
            })
          );
        })
      );

      const imageUrl: string[] = await Promise.all(imagePromise).then((res) =>
        res.map((r) => r.data)
      );
      resolve(imageUrl);
    });
  const { mutate: upload, isLoading: isChapterUpload } = useMutation({
    mutationFn: async (values: ChapterUploadPayload) => {
      // eslint-disable-next-line no-unused-vars
      const { image, ...payload } = values;

      const imageURL = await imgUpload();

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
    if (images.length < 5)
      return form.setError('image', {
        type: 'custom',
        message: 'Tối thiểu 5 ảnh',
      });
    if (values.chapterName) {
      if (values.chapterName.length < 3) {
        return form.setError('chapterName', {
          type: 'min',
          message: 'Tối thiểu ba kí tự',
        });
      } else if (values.chapterName.length > 256) {
        return form.setError('chapterName', {
          type: 'max',
          message: 'Tối đa 256 kí tự',
        });
      }
    }

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
                  min={0}
                  value={field.value}
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
              <FormLabel
                title="Sẽ bỏ qua ảnh lớn hơn 4MB"
                className="after:content-['*'] after:ml-0.5 after:text-red-500"
              >
                Ảnh
              </FormLabel>
              <FormMessage />

              {images.length ? (
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    className="flex items-center justify-center gap-1"
                    onClick={(e) => {
                      e.preventDefault();

                      const target = document.getElementById(
                        'add-image'
                      ) as HTMLInputElement;
                      target.click();
                    }}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Thêm ảnh
                  </Button>
                  <Button
                    type="button"
                    variant={'destructive'}
                    className="flex items-center justify-center gap-1"
                    onClick={(e) => {
                      e.preventDefault();
                      setImages([]);
                    }}
                  >
                    <Trash className="w-4 h-4" />
                    Xóa toàn bộ
                  </Button>
                </div>
              ) : null}

              {images.length ? (
                <DnDChapterImage
                  isUpload={isChapterUpload}
                  items={images}
                  setItems={setImages}
                />
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById(
                      'add-image'
                    ) as HTMLInputElement;
                    target.click();
                  }}
                  className="w-40 h-52 rounded-md border-2 border-dashed flex items-center justify-center"
                >
                  <ImagePlus className="w-8 h-8 opacity-50" />
                </button>
              )}

              <FormControl>
                <input
                  id="add-image"
                  ref={field.ref}
                  multiple
                  type="file"
                  accept=".jpg, .png, .jpeg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      let arr: {
                        src: string;
                        name: string;
                      }[] = [];
                      for (let i = 0; i < e.target.files.length; i++) {
                        if (e.target.files.item(i)!.size > 4 * 1000 * 1000) {
                          continue;
                        }

                        const imageUrl = URL.createObjectURL(
                          e.target.files.item(i)!
                        );
                        arr.push({
                          src: imageUrl,
                          name: e.target.files.item(i)!.name,
                        });
                      }
                      e.target.value = '';
                      setImages((prev) => [...prev, ...arr]);
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          isLoading={isChapterUpload}
          disabled={isChapterUpload}
          className="w-full"
        >
          Đăng
        </Button>
      </form>
    </Form>
  );
};

export default ChapterUpload;
