'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { Tags } from '@/lib/query';
import {
  MangaUploadPayload,
  MangaUploadValidator,
} from '@/lib/validators/manga';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Form } from '../ui/Form';
import MangaAltNameForm from './components/MangaAltNameForm';
import MangaDescForm from './components/MangaDescForm';
import MangaDiscForm from './components/MangaDiscForm';
import MangaFBForm from './components/MangaFBForm';
import MangaImageForm from './components/MangaImageForm';
import MangaNameForm from './components/MangaNameForm';
import MangaReviewForm from './components/MangaReviewForm';

const MangaTagForm = dynamic(() => import('./components/MangaTagForm'), {
  ssr: false,
});
const MangaAuthorForm = dynamic(() => import('./components/MangaAuthorForm'), {
  ssr: false,
});

const MangaUpload = ({ tag }: { tag: Tags[] }) => {
  const router = useRouter();
  const {
    notFoundToast,
    loginToast,
    serverErrorToast,
    successToast,
    verifyToast,
  } = useCustomToast();

  const form = useForm<MangaUploadPayload>({
    resolver: zodResolver(MangaUploadValidator),
    defaultValues: {
      image: undefined,
      name: '',
      description: undefined,
      review: '',
      altName: '',
      author: [],
      tag: [],
      facebookLink: '',
      discordLink: '',
    },
  });

  const { mutate: Upload, isLoading: isUploadManga } = useMutation({
    mutationKey: ['upload-manga'],
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

      const blob = await fetch(image).then((res) => res.blob());
      form.append('image', blob);

      form.append('name', name);
      form.append('description', JSON.stringify(description));
      form.append('review', review);
      altName && form.append('altName', altName);
      facebookLink && form.append('facebookLink', facebookLink);
      discordLink && form.append('discordLink', discordLink);
      author.map((a) => form.append('author', JSON.stringify(a)));
      tag.map((t) => form.append('tag', JSON.stringify(t)));

      const { data } = await axios.post('/api/manga', form);

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
        if (e.response?.status === 401) return loginToast();
        if (e.response?.status === 404) return notFoundToast();
        if (e.response?.status === 400) return verifyToast();
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
      router.push('/me/manga');
      router.refresh();

      return successToast();
    },
  });

  const onSubmitHandler = (values: MangaUploadPayload) => {
    Upload(values);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitHandler)}
          className="space-y-6"
        >
          <MangaImageForm form={form} />

          <MangaNameForm form={form} />

          <MangaAltNameForm form={form} />

          <MangaAuthorForm form={form} />

          <MangaTagForm form={form} tag={tag} />

          <MangaDescForm form={form} />

          <MangaReviewForm form={form} />

          <MangaFBForm form={form} />

          <MangaDiscForm form={form} />

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
    </>
  );
};

export default MangaUpload;
