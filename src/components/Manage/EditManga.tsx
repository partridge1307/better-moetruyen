'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { Tags } from '@/lib/query';
import {
  MangaUploadPayload,
  MangaUploadValidator,
} from '@/lib/validators/manga';
import { zodResolver } from '@hookform/resolvers/zod';
import { Manga, MangaAuthor, Tag } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Form } from '../ui/Form';
import MangaAltNameForm from './components/MangaAltNameForm';
import MangaDescForm from './components/MangaDescForm';
import MangaDiscForm from './components/MangaDiscForm';
import MangaFBForm from './components/MangaFBForm';
import MangaNameForm from './components/MangaNameForm';
import MangaReviewForm from './components/MangaReviewForm';

const MangaImageForm = dynamic(() => import('./components/MangaImageForm'), {
  ssr: false,
});
const MangaTagForm = dynamic(() => import('./components/MangaTagForm'), {
  ssr: false,
});
const MangaAuthorForm = dynamic(() => import('./components/MangaAuthorForm'), {
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

      if (image.startsWith('blob')) {
        const blob = await fetch(image).then((res) => res.blob());
        form.append('image', blob);
      } else {
        form.append('image', image);
      }

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

  function onSubmitHandler(values: MangaUploadPayload) {
    const payload: MangaUploadPayload = {
      ...values,
      description: values.description ?? manga.description,
    };

    Update(payload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <MangaImageForm form={form} />

        <MangaNameForm form={form} />

        <MangaAltNameForm form={form} />

        <MangaAuthorForm form={form} existAuthors={manga.author} />

        <MangaTagForm form={form} tag={tags} existTags={manga.tags} />

        <MangaDescForm form={form} initialContent={manga.description} />

        <MangaReviewForm form={form} />

        <MangaFBForm form={form} />

        <MangaDiscForm form={form} />

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
