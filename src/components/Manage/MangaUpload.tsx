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
const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});

const MangaUpload = ({ tag }: { tag: Tags }) => {
  const { verifyToast } = useCustomToast();
  const form = useForm<MangaUploadPayload>({
    resolver: zodResolver(MangaUploadValidator),
    defaultValues: {
      image: undefined,
      name: '',
      description: undefined,
      author: [],
      tag: [],
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
      const { image, name, description, author, tag } = values;

      const form = new FormData();
      form.append('image', image);
      form.append('name', name);
      form.append('description', JSON.stringify(description));
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
        if (e.response?.status === 401)
          return toast({
            title: 'Yêu cầu đăng nhập',
            description: 'Hành động này yêu cầu đăng nhập',
            variant: 'destructive',
          });
        if (e.response?.status === 404)
          return toast({
            title: 'Không tìm thấy người dùng',
            description: 'Không tìm thấy người dùng. vui lòng thử lại',
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
      form.setError('description', {
        type: 'custom',
        message: 'Mô tả không được bỏ trống',
      });
    }

    const payload: MangaUploadPayload = {
      image: values.image,
      name: values.name,
      author: values.author,
      tag: values.tag,
      description: editor,
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
                <Input placeholder="Tên truyện" {...field} />
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
