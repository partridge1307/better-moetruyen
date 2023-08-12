'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import {
  ChapterUploadPayload,
  ChapterUploadValidator,
} from '@/lib/validators/upload';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Chapter } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { ImagePlus, PlusCircle, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, Suspense, lazy, useState } from 'react';
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
const DnDChapterImage = lazy(() => import('../DragAndDrop'));

interface ChapterEditProps {
  chapter: Pick<
    Chapter,
    'id' | 'chapterIndex' | 'name' | 'volume' | 'images' | 'mangaId'
  >;
}

const ChapterEdit: FC<ChapterEditProps> = ({ chapter }) => {
  const { loginToast, notFoundToast } = useCustomToast();
  const router = useRouter();
  const [images, setImages] = useState<{ src: string; name: string }[]>(
    chapter.images.map((img, index) => ({
      src: img,
      name: `Trang ${index + 1}`,
    }))
  );
  const [updateProgress, setUpdateProgress] = useState<number | null>(null);

  const form = useForm<ChapterUploadPayload>({
    resolver: zodResolver(ChapterUploadValidator),
    defaultValues: {
      chapterIndex: chapter.chapterIndex,
      chapterName: chapter.name ?? '',
      volume: chapter.volume,
      image: chapter.images,
    },
  });

  const { mutate: Edit, isLoading: isEditting } = useMutation({
    mutationFn: async (values: ChapterUploadPayload) => {
      const { chapterIndex, chapterName, volume } = values;

      const form = new FormData();
      form.append('chapterIndex', `${chapterIndex}`);
      form.append('volume', `${volume}`);
      chapterName ? form.append('chapterName', chapterName) : null;

      for (const image of images) {
        if (!image.src.startsWith('blob')) {
          form.append('images', image.src);
        } else {
          const blob = await fetch(image.src).then((res) => res.blob());
          form.append('images', blob, image.name);
        }
      }

      const { data } = await axios.patch(
        `/api/chapter/${chapter.id}/edit`,
        form,
        {
          onDownloadProgress(progressEvent) {
            const percentCompleted = Math.floor(
              (progressEvent.loaded * 100) / progressEvent.total!
            );
            setUpdateProgress(percentCompleted);
          },
        }
      );
      return data as string;
    },
    onError: (e) => {
      setUpdateProgress(null);

      if (e instanceof AxiosError) {
        if (e.response?.status === 401) return loginToast();
        if (e.response?.status === 404) return notFoundToast();
      }

      return toast({
        title: 'Có lỗi xảy ra',
        description: 'Có lỗi xảy ra. Vui lòng thử lại sau',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.push(`/me/manga/${chapter.mangaId}/chapter`);
      router.refresh();
      setUpdateProgress(null);

      return toast({
        title: 'Thành công',
      });
    },
  });

  function onSubmitHandler(values: ChapterUploadPayload) {
    if (images.length < 1)
      return form.setError('image', {
        type: 'custom',
        message: 'Tối thiểu 1 ảnh',
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

    Edit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <FormField
          control={form.control}
          name="chapterIndex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>STT Chapter</FormLabel>
              <FormMessage />
              <FormControl>
                <Input
                  ref={field.ref}
                  type="number"
                  value={field.value}
                  onChange={(e) => {
                    if (e.target.valueAsNumber) {
                      field.onChange(e.target.valueAsNumber);
                    } else {
                      field.onChange(field.value);
                    }
                  }}
                  onBlur={field.onBlur}
                />
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
                <Input {...field} />
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
                  ref={field.ref}
                  type="number"
                  min={0}
                  value={field.value}
                  onChange={(e) => {
                    if (e.target.valueAsNumber) {
                      field.onChange(e.target.valueAsNumber);
                    } else {
                      field.onChange(field.value);
                    }
                  }}
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
              ) : (
                <button
                  type="button"
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

              {images.length ? (
                <Suspense
                  fallback={
                    <div className="w-40 h-52 dark:bg-zinc-800 animate-pulse" />
                  }
                >
                  <DnDChapterImage
                    isUpload={isEditting}
                    items={images}
                    setItems={setImages}
                  />
                </Suspense>
              ) : (
                <button
                  type="button"
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
                  ref={field.ref}
                  id="add-image"
                  type="file"
                  multiple
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

        {updateProgress ? (
          updateProgress >= 100 ? (
            <p className="text-center">Đang gửi đến Server...</p>
          ) : (
            <Progress value={updateProgress} />
          )
        ) : null}

        <Button
          type="submit"
          isLoading={isEditting}
          disabled={isEditting}
          className="w-full"
        >
          Sửa
        </Button>
      </form>
    </Form>
  );
};

export default ChapterEdit;
