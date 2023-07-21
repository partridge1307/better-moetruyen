'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { Tags } from '@/lib/query';
import { disRegex, fbRegex } from '@/lib/utils';
import {
  MangaUploadPayload,
  MangaUploadValidator,
  authorInfoProps,
  tagInfoProps,
} from '@/lib/validators/upload';
import type EditorJS from '@editorjs/editorjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebouncedState } from '@mantine/hooks';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/Form';
import { Input } from '../ui/Input';
import MangaAuthorUpload, { authorResultProps } from './MangaAuthorUpload';
import MangaImageUpload from './MangaImageUpload';
import MangaTagUpload from './MangaTagUpload';
const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => <Loader2 className="h-6 w-6 animate-spin" />,
});

interface EditMangaProps {
  manga: Manga & {
    author: MangaAuthor[];
    tags: Tag[];
  };
  tags: Tags;
}

const EditManga: FC<EditMangaProps> = ({ manga, tags }) => {
  const { loginToast, notFoundToast } = useCustomToast();
  const router = useRouter();
  const form = useForm<MangaUploadPayload>({
    resolver: zodResolver(MangaUploadValidator),
    defaultValues: {
      image: manga.image,
      name: manga.name,
      description: undefined,
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
    mutationKey: ['fetch-author'],
    mutationFn: async (inputValue: string) => {
      const { data } = await axios.get(`/api/manga/author/${inputValue}`);

      return data as authorResultProps;
    },
  });
  const { mutate: Update, isLoading: isUpdatingManga } = useMutation({
    mutationKey: ['update-manga'],
    mutationFn: async (values: MangaUploadPayload) => {
      const {
        image,
        name,
        description,
        author,
        tag,
        facebookLink,
        discordLink,
      } = values;

      const form = new FormData();
      form.append('image', image);
      form.append('name', name);
      form.append('description', JSON.stringify(description));
      form.append('facebook', facebookLink);
      form.append('discord', discordLink);
      author.map((a) => form.append('author', JSON.stringify(a)));
      tag.map((t) => form.append('tag', JSON.stringify(t)));

      const { data } = await axios.patch(`/api/manga/${manga.id}/edit`, form);

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

      return toast({
        title: 'Có lỗi xảy ra',
        description: 'Có lỗi xảy ra. Vui lòng thử lại',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.push(`/me/manga`);
      router.refresh();

      return toast({
        title: 'Thành công',
      });
    },
  });
  const [previewImage, setPreviewImage] = useState<string | undefined>(
    manga.image
  );
  const [authorSelected, setAuthorSelected] = useState<authorInfoProps[]>(
    manga.author
  );
  const [tagSelect, setTagSelect] = useState<tagInfoProps[]>(manga.tags);
  const [authorInput, setAuthorInput] = useDebouncedState('', 300);
  const editorRef = useRef<EditorJS>();

  useEffect(() => {
    if (authorInput) FetchAuthor(authorInput);
  }, [FetchAuthor, authorInput]);

  async function onSubmitHandler(values: MangaUploadPayload) {
    const editor = await editorRef.current?.save();
    const desc = editor?.blocks.length ? editor : manga.description;

    if (values.facebookLink && !fbRegex.test(values.facebookLink)) {
      return form.setError('facebookLink', {
        type: 'custom',
        message: 'Đường dẫn Facebook không hợp lệ',
      });
    }
    if (values.discordLink && !disRegex.test(values.discordLink)) {
      return form.setError('discordLink', {
        type: 'custom',
        message: 'Đường dẫn Discord không hợp lệ',
      });
    }

    const payload: MangaUploadPayload = {
      image: values.image,
      name: values.name,
      author: values.author,
      tag: values.tag,
      description: desc,
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
              <Input {...field} />
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
              <FormDescription>
                (Bỏ qua nếu không có chỉnh sửa gì)
              </FormDescription>
              <FormMessage />
              <FormControl>
                <Editor editorRef={editorRef} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="facebookLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Link Facebook (nếu có){' '}
                <span
                  className="text-red-500"
                  title="Chỉ nhận link Profile hoặc Page"
                >
                  *
                </span>
              </FormLabel>
              <FormMessage />
              <FormControl>
                <Input placeholder="Nhập link Facebook" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discordLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Link Discord (nếu có){' '}
                <span className="text-red-500" title="Chỉ nhận link Invite">
                  *
                </span>
              </FormLabel>
              <FormMessage />
              <FormControl>
                <Input placeholder="Nhập link Discord" {...field} />
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
