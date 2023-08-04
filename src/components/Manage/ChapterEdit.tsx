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
import axios, { AxiosError, AxiosResponse } from 'axios';
import { ImagePlus, PlusCircle, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
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

interface ChapterEditProps {
  chapter: Pick<
    Chapter,
    'id' | 'chapterIndex' | 'name' | 'volume' | 'images' | 'mangaId'
  >;
}

const ChapterEdit: FC<ChapterEditProps> = ({ chapter }) => {
  const { loginToast, notFoundToast } = useCustomToast();
  const router = useRouter();
  const [images, setImages] = useState<
    { src: string; name: string; progress?: number }[]
  >(
    chapter.images.map((img, index) => ({
      src: img,
      name: `Trang ${index + 1}`,
    }))
  );

  const form = useForm<ChapterUploadPayload>({
    resolver: zodResolver(ChapterUploadValidator),
    defaultValues: {
      chapterIndex: chapter.chapterIndex,
      chapterName: chapter.name ?? '',
      volume: chapter.volume,
      image: chapter.images,
    },
  });

  const imgUpload = (
    blobStrArr: { src: string; index: number }[]
  ): Promise<{ src: string; index: number }[]> =>
    new Promise(async (resolve) => {
      let imagePromise: Promise<AxiosResponse>[] = [];

      await Promise.all(
        blobStrArr.map(async (img) => {
          const blob = await fetch(img.src).then((res) => res.blob());
          const form = new FormData();
          form.append('file', blob);
          imagePromise.push(
            axios.post('/api/image', form, {
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.floor(
                  (progressEvent.loaded * 100) / progressEvent.total!
                );
                images[img.index].progress = percentCompleted;
                setImages([...images]);
              },
            })
          );
        })
      );

      const imageUrl: { src: string; index: number }[] = await Promise.all(
        imagePromise
      ).then((res) =>
        res.map((r, idx) => {
          blobStrArr[idx].src = r.data;
          return blobStrArr[idx];
        })
      );
      resolve(imageUrl);
    });
  const { mutate: Edit, isLoading: isEditting } = useMutation({
    mutationFn: async (values: ChapterUploadPayload) => {
      const { image, ...payload } = values;
      const blobStrArr = images.flatMap((img, index) =>
        img.src.startsWith('blob') ? { src: img.src, index } : []
      );

      if (blobStrArr.length) {
        const imageRes = await imgUpload(blobStrArr);
        await Promise.all(
          imageRes.map((img) => (images[img.index].src = img.src))
        );

        const { data } = await axios.patch(`/api/chapter/${chapter.id}/edit`, {
          images: images.map((img) => img.src),
          ...payload,
        });
        return data;
      } else {
        const { data } = await axios.patch(`/api/chapter/${chapter.id}/edit`, {
          images: images.map((img) => img.src),
          ...payload,
        });
        return data;
      }
    },
    onError: (e) => {
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

      return toast({
        title: 'Thành công',
      });
    },
  });

  function onSubmitHandler(values: ChapterUploadPayload) {
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
                <DnDChapterImage
                  isUpload={isEditting}
                  items={images}
                  setItems={setImages}
                />
              ) : null}

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
