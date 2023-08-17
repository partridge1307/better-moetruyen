'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { Tags } from '@/lib/query';
import {
  MangaUploadPayload,
  MangaUploadValidator,
  authorInfoProps,
  tagInfoProps,
} from '@/lib/validators/upload';
import type EditorJS from '@editorjs/editorjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebouncedValue } from '@mantine/hooks';
import { Manga, MangaAuthor, Tag } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useRef, useState } from 'react';
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
import type { authorResultProps } from './MangaAuthorUpload';
const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => <Loader2 className="h-6 w-6 animate-spin" />,
});
const MangaImageUpload = dynamic(() => import('./MangaImageUpload'), {
  ssr: false,
});
const MangaTagUpload = dynamic(() => import('./MangaTagUpload'), {
  ssr: false,
});
const MangaAuthorUpload = dynamic(() => import('./MangaAuthorUpload'), {
  ssr: false,
});

interface EditMangaProps {
  manga: Pick<
    Manga,
    | 'id'
    | 'name'
    | 'description'
    | 'review'
    | 'altName'
    | 'image'
    | 'facebookLink'
    | 'discordLink'
  > & {
    author: MangaAuthor[];
    tags: Tag[];
  };
  tags: Tags[];
}

const EditManga: FC<EditMangaProps> = ({ manga, tags }) => {
  const { loginToast, notFoundToast, successToast, serverErrorToast } =
    useCustomToast();
  const router = useRouter();
  const form = useForm<MangaUploadPayload>({
    resolver: zodResolver(MangaUploadValidator),
    defaultValues: {
      image: manga.image,
      name: manga.name,
      description: undefined,
      review: manga.review ?? '',
      altName: manga.altName ?? '',
      author: manga.author,
      tag: manga.tags,
      facebookLink: manga.facebookLink ?? '',
      discordLink: manga.discordLink ?? '',
    },
  });
  const {
    data: authorResult,
    mutate: FetchAuthor,
    isLoading: isFetchingAuthor,
  } = useMutation({
    mutationFn: async (inputValue: string) => {
      const { data } = await axios.get(`/api/manga/author?q=${inputValue}`);

      return data as authorResultProps;
    },
  });
  const { mutate: Update, isLoading: isUpdatingManga } = useMutation({
    mutationFn: async (values: MangaUploadPayload) => {
      const {
        image,
        name,
        description,
        review,
        altName,
        author,
        tag,
        facebookLink,
        discordLink,
      } = values;

      const form = new FormData();
      form.append('image', image);
      form.append('name', name);
      form.append('description', JSON.stringify(description));
      form.append('review', review);
      altName && form.append('altName', altName);
      facebookLink && form.append('facebookLink', facebookLink);
      discordLink && form.append('discordLink', discordLink);
      author.map((a) => form.append('author', JSON.stringify(a)));
      tag.map((t) => form.append('tag', JSON.stringify(t)));

      const { data } = await axios.patch(`/api/manga/${manga.id}`, form);

      return data;
    },
    onError: (e) => {
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) return loginToast();
        if (e.response?.status === 404) return notFoundToast();
        if (e.response?.status === 406)
          return toast({
            title: 'Đường dẫn không hợp lệ',
            description: 'Đường dẫn FB hoặc Discord không hợp lệ',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push(`/me/manga/${manga.id}`);
      router.refresh();

      return successToast();
    },
  });
  const [previewImage, setPreviewImage] = useState<string | undefined>(
    manga.image
  );
  const [authorSelected, setAuthorSelected] = useState<authorInfoProps[]>(
    manga.author
  );
  const [tagSelect, setTagSelect] = useState<tagInfoProps[]>(manga.tags);
  const editorRef = useRef<EditorJS>();
  const [authorInput, setAuthorInput] = useState<string>('');
  const [debouncedValue] = useDebouncedValue(authorInput, 300);

  useEffect(() => {
    if (debouncedValue) FetchAuthor(debouncedValue);
  }, [FetchAuthor, debouncedValue]);

  async function onSubmitHandler(values: MangaUploadPayload) {
    const editor = await editorRef.current?.save();
    if (!editor?.blocks.length)
      return form.setError('description', {
        type: 'custom',
        message: 'Phải có mô tả',
      });

    const payload: MangaUploadPayload = {
      image: values.image,
      name: values.name,
      author: values.author,
      tag: values.tag,
      description: editor,
      review: values.review,
      facebookLink: values.facebookLink,
      discordLink: values.discordLink,
    };

    Update(payload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <MangaImageUpload
          form={form}
          previewImage={previewImage}
          setPreviewImage={(value) => setPreviewImage(value)}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên truyện</FormLabel>
              <FormMessage />
              <FormControl>
                <Input placeholder="Tên truyện" autoComplete="off" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="altName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên khác(Nếu có)</FormLabel>
              <FormMessage />
              <FormControl>
                <Input placeholder="Tên khác" autoComplete="off" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <MangaAuthorUpload
          form={form}
          authorSelected={authorSelected}
          setAuthorSelected={(value) => setAuthorSelected(value)}
          authorInput={authorInput}
          setAuthorInput={(value) => setAuthorInput(value)}
          isFetchingAuthor={isFetchingAuthor}
          authorResult={authorResult}
        />

        <MangaTagUpload
          form={form}
          tag={tags}
          tagSelect={tagSelect}
          setTagSelect={(value) => setTagSelect(value)}
        />

        <FormField
          control={form.control}
          name="description"
          render={() => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormMessage />
              <FormControl>
                <Editor editorRef={editorRef} initialData={manga.description} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="review"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className="after:content-['*'] after:text-red-500 after:ml-0.5"
                title="Nội dung này sẽ được hiển thị bên ngoài trang chủ"
              >
                Sơ lược
              </FormLabel>
              <FormMessage />
              <FormControl>
                <Input placeholder="Nhập nội dung..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="facebookLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link Facebook (nếu có)</FormLabel>
              <FormMessage />
              <FormControl>
                <Input placeholder="https://facebook.com/" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discordLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link Discord (nếu có)</FormLabel>
              <FormMessage />
              <FormControl>
                <Input placeholder="https://discord.gg/" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          isLoading={isUpdatingManga}
          disabled={isUpdatingManga}
          className="w-full"
        >
          Cập nhật
        </Button>
      </form>
    </Form>
  );
};

export default EditManga;
