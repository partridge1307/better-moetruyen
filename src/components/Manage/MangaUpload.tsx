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
import { useMutation } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
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
import MangaAuthorUpload, { type authorResultProps } from './MangaAuthorUpload';
import MangaImageUpload from './MangaImageUpload';
import MangaTagUpload from './MangaTagUpload';
import { useRouter } from 'next/navigation';
import { disRegex, fbRegex } from '@/lib/utils';
const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => <Loader2 className="h-6 w-6 animate-spin" />,
});

const MangaUpload = ({ tag }: { tag: Tags }) => {
  const { verifyToast, notFoundToast, loginToast } = useCustomToast();
  const router = useRouter();
  const form = useForm<MangaUploadPayload>({
    resolver: zodResolver(MangaUploadValidator),
    defaultValues: {
      image: undefined,
      name: '',
      description: undefined,
      author: [],
      tag: [],
      facebookLink: '',
      discordLink: '',
    },
  });

  const {
    data: authorResult,
    mutate: FetchAuthor,
    isLoading: isFetchingAuthor,
  } = useMutation({
    mutationFn: async (inputValue: string) => {
      const { data } = await axios.get(`/api/manga/author/${inputValue}`);

      return data as authorResultProps;
    },
  });
  const { mutate: Upload, isLoading: isUploadManga } = useMutation({
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

      const { data } = await axios.post('/api/manga/upload', form);

      return data;
    },
    onError: (e) => {
      if (e instanceof AxiosError) {
        if (e.response?.status === 409)
          return toast({
            title: 'Trùng lặp manga',
            description: 'Bạn đã tạo manga này rồi',
            variant: 'destructive',
          });
        if (e.response?.status === 400) {
          return verifyToast();
        }
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
      router.push('/me/manga');
      router.refresh();
      return toast({
        title: 'Thành công',
      });
    },
  });

  const [previewImage, setPreviewImage] = useState<string>();
  const [authorInput, setAuthorInput] = useState<string>('');
  const debouncedValue = useDebounce(authorInput, 300);
  const [authorSelected, setAuthorSelected] = useState<authorInfoProps[]>([]);
  const [tagSelect, setTagSelect] = useState<tagInfoProps[]>([]);
  const editorRef = useRef<EditorJS>();

  useEffect(() => {
    if (!!debouncedValue) FetchAuthor(debouncedValue);
  }, [FetchAuthor, debouncedValue]);

  const onSubmitHandler = async (values: MangaUploadPayload) => {
    const editor = await editorRef.current?.save();
    if (!editor?.blocks.length) {
      return form.setError('description', {
        type: 'custom',
        message: 'Mô tả không được bỏ trống',
      });
    }
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
      description: editor,
      facebookLink: values.facebookLink,
      discordLink: values.discordLink,
    };

    Upload(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <MangaImageUpload
          form={form}
          setPreviewImage={(value) => setPreviewImage(value)}
          previewImage={previewImage}
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
          tag={tag}
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
          isLoading={isUploadManga}
          disabled={isUploadManga}
          className="w-full"
        >
          Đăng
        </Button>
      </form>
    </Form>
  );
};

export default MangaUpload;