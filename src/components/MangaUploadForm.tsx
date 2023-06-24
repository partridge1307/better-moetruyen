'use client';

import {
  CreateMangaUploadPayload,
  MangaUploadValidator,
} from '@/lib/validators/upload';
import { zodResolver } from '@hookform/resolvers/zod';
import { useList } from '@uidotdev/usehooks';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import MangaTagModal from './MangaTagModal';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/Form';
import { Input } from './ui/Input';
import { Textarea } from './ui/TextArea';
import { Button } from './ui/Button';

interface MangaUploadFormProps {
  tag: object[];
}

const MangaUploadForm: FC<MangaUploadFormProps> = ({ tag }) => {
  const form = useForm<CreateMangaUploadPayload>({
    resolver: zodResolver(MangaUploadValidator),
    defaultValues: {
      name: '',
      description: '',
      author: '',
      tag: [],
    },
  });
  const [] = useList(['']);

  const onSubmit = (values: CreateMangaUploadPayload) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
              <FormDescription>Tên truyện bạn muốn upload</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormMessage />
              <FormControl>
                <Textarea
                  placeholder="Mô tả"
                  rows={5}
                  {...field}
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>
                Hãy mô tả truyện bạn muốn upload
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tác giả</FormLabel>
              <FormMessage />
              <FormControl>
                <Input placeholder="Tác giả" {...field} />
              </FormControl>
              <FormDescription>
                Tên tác giả của bộ bạn muốn upload
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => <MangaTagModal tag={tag} field={field} />}
        />

        <Button type="submit">Upload</Button>
      </form>
    </Form>
  );
};

export default MangaUploadForm;
