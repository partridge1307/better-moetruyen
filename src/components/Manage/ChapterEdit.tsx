'use client';

import { cn } from '@/lib/utils';
import {
  ChapterEditUploadPayload,
  ChapterEditUploadValidator,
} from '@/lib/validators/upload';
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from '@hello-pangea/dnd';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Chapter } from '@prisma/client';
import { PlusCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { FC, useRef, useState } from 'react';
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
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ChapterEditProps {
  chapter: Pick<
    Chapter,
    'id' | 'chapterIndex' | 'name' | 'volume' | 'images' | 'mangaId'
  >;
}

const reorder = (
  list: { image: string; index: number; type: boolean }[],
  startIndex: number,
  endIndex: number
) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const UploadImage = (
  newImg: { image: File; blobImg: string }[]
): Promise<{ image: string; blobImg: string }[]> =>
  new Promise(async (resolve) => {
    let imagePromise: Promise<AxiosResponse>[] = [];
    newImg.map((img) => {
      const form = new FormData();
      form.append('file', img.image);
      imagePromise.push(axios.post('/api/image', form));
    });

    const imageUrl = await Promise.all(imagePromise).then((res) =>
      res.map((r, idx) => ({ image: r.data, blobImg: newImg[idx].blobImg }))
    );
    resolve(imageUrl);
  });

const ChapterEdit: FC<ChapterEditProps> = ({ chapter }) => {
  const { loginToast, notFoundToast } = useCustomToast();
  const router = useRouter();
  const form = useForm<ChapterEditUploadPayload>({
    resolver: zodResolver(ChapterEditUploadValidator),
    defaultValues: {
      chapterIndex: chapter.chapterIndex,
      chapterName: chapter.name ?? '',
      volume: chapter.volume,
      image: chapter.images,
    },
  });
  const [dndImg, setDndImg] = useState<
    { image: string; index: number; type: boolean }[]
  >(
    chapter.images.map((img, idx) => ({ image: img, index: idx, type: false }))
  );
  const [newImg, setNewImg] = useState<
    {
      image: File;
      blobImg: string;
    }[]
  >([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { mutate: Edit, isLoading: isEditting } = useMutation({
    mutationFn: async (values: ChapterEditUploadPayload) => {
      const { image, ...payload } = ChapterEditUploadValidator.parse(values);
      if (newImg.length) {
        const imgsAfterUploaded = await UploadImage(newImg);
        imgsAfterUploaded.map(
          (img) =>
            (image[dndImg.findIndex((i) => i.image === img.blobImg)] =
              img.image)
        );

        const { data } = await axios.patch(`/api/chapter/${chapter.id}/edit`, {
          images: image,
          ...payload,
        });
        return data;
      } else {
        const { data } = await axios.patch(`/api/chapter/${chapter.id}/edit`, {
          images: image,
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

      return toast({
        title: 'Thành công',
      });
    },
  });

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      dndImg,
      result.source.index,
      result.destination.index
    );
    form.setValue(
      'image',
      items.map((item) => item.image)
    );

    setDndImg(
      items.map((item, idx) => ({
        image: item.image,
        index: idx,
        type: item.type,
      }))
    );
  }
  function onRemoveItem(index: number) {
    const dndCopy = dndImg;
    dndCopy.splice(index, 1);
    form.setValue(
      'image',
      dndCopy.map((d) => d.image)
    );
    setDndImg(dndCopy);
  }
  function onAddItem(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      let imgUrls: { image: string; index: number; type: boolean }[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const image = URL.createObjectURL(e.target.files.item(i)!);
        imgUrls.push({
          image,
          index: -1,
          type: true,
        });
        newImg.push({ image: e.target.files.item(i)!, blobImg: image });
        setNewImg(newImg);
      }
      setDndImg([...dndImg, ...imgUrls]);
    }
  }

  function onSubmitHandler(values: ChapterEditUploadPayload) {
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
          render={() => (
            <FormItem className="space-y-4">
              <FormLabel>Ảnh chapter</FormLabel>
              <FormMessage />
              <div>
                <Button
                  className="flex gap-1 max-sm:w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    inputRef.current?.click();
                  }}
                >
                  <PlusCircle className="w-4 h-4" />
                  Thêm ảnh
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  className="hidden"
                  multiple
                  onChange={onAddItem}
                />
              </div>
              <FormControl>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        className={cn(
                          'w-full max-h-[500px] overflow-auto no-scrollbar rounded-md py-4 flex flex-col items-center',
                          snapshot.isDraggingOver
                            ? 'dark:bg-zinc-700'
                            : 'dark:bg-zinc-900'
                        )}
                        {...provided.droppableProps}
                      >
                        {dndImg.length ? (
                          dndImg.map((t, idx) => (
                            <Draggable
                              key={idx}
                              draggableId={`${idx}`}
                              index={idx}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{ ...provided.draggableProps.style }}
                                  className={cn(
                                    'w-[90%] p-2 md:p-4 rounded-md m-2',
                                    snapshot.isDragging
                                      ? 'dark:bg-zinc-900'
                                      : t.type
                                      ? 'dark:bg-green-600'
                                      : 'dark:bg-zinc-800'
                                  )}
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 md:gap-4">
                                      <p className="text-4xl">=</p>
                                      <div className="flex gap-4 md:gap-6">
                                        <div className="relative h-24 w-16 md:h-28 md:w-24">
                                          <Image
                                            fill
                                            sizes="0%"
                                            priority
                                            src={t.image}
                                            alt={`Image-${idx}`}
                                            className="rounded-md object-contain"
                                          />
                                        </div>
                                        <p>Trang {t.index + 1}</p>
                                      </div>
                                    </div>
                                    <Trash2
                                      className="h-6 w-6 md:w-8 md:h-8 text-red-600 cursor-pointer"
                                      onClick={() => onRemoveItem(idx)}
                                    />
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <div>Không có ảnh</div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
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
