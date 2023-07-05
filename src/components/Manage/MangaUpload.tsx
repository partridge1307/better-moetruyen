'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { Tags } from '@/lib/query';
import { cn } from '@/lib/utils';
import {
  MangaUploadPayload,
  MangaUploadValidator,
  authorInfoProps,
  tagInfoProps,
} from '@/lib/validators/upload';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import axios, { AxiosError } from 'axios';
import { Check, ImagePlus, Loader2, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import 'react-quill/dist/quill.snow.css';
import { Button } from '../ui/Button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/Command';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/Form';
import { Input } from '../ui/Input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

type authorResultProps = {
  author: authorInfoProps[];
};

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
      const { image, name, description, author, tag } =
        MangaUploadValidator.parse(values);

      const form = new FormData();
      form.append('image', image);
      form.append('name', name);
      form.append('description', description);
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

  useEffect(() => {
    if (!!debouncedValue) FetchAuthor(debouncedValue);
  }, [FetchAuthor, debouncedValue]);

  const [tagSelect, setTagSelect] = useState<tagInfoProps[]>([]);
  const [editorValue, setEditorValue] = useState<string>('');

  const onSubmitHandler = (values: MangaUploadPayload) => {
    Upload(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ảnh bìa</FormLabel>
              <FormMessage />
              <FormControl>
                <div className="relative w-40 h-40 border rounded-lg">
                  <Input
                    ref={field.ref}
                    type="file"
                    accept=".jpg, .jpeg, .png"
                    className="absolute w-full h-full opacity-0 z-10"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        field.onChange(e.target.files[0]);
                        setPreviewImage(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                  />
                  {!!previewImage ? (
                    <Image
                      fill
                      src={previewImage!}
                      alt="Preview Manga Image"
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ImagePlus className="h-8 w-8" />
                    </div>
                  )}
                </div>
              </FormControl>
            </FormItem>
          )}
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

        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tác giả</FormLabel>
              <FormMessage />
              <FormControl>
                <div className="border rounded-lg">
                  <ul className="flex gap-x-2">
                    {authorSelected.map((auth) => (
                      <li
                        key={auth.id}
                        className="bg-zinc-800 p-1 flex items-center gap-x-1 rounded-md"
                      >
                        <span>{auth.name}</span>
                        <X
                          className="h-5 w-5 text-red-500 cursor-pointer"
                          onClick={() => {
                            const authorVal = [
                              ...authorSelected.filter(
                                (a) => a.name !== auth.name
                              ),
                            ];
                            setAuthorSelected(authorVal);
                            form.setValue('author', authorVal);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                  <Input
                    ref={field.ref}
                    placeholder="Tác giả"
                    value={authorInput}
                    onChange={(e) => {
                      setAuthorInput(e.target.value);
                    }}
                    className="border-none focus:ring-0 focus-visible:ring-offset-transparent focus-visible:ring-transparent"
                  />
                </div>
              </FormControl>
              <ul className="flex items-center">
                {isFetchingAuthor && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {!isFetchingAuthor && authorResult?.author.length
                  ? authorResult.author.map((auth) => (
                      <li
                        key={auth.id}
                        className={`cursor-pointer p-1 bg-slate-800 rounded-md ${
                          authorSelected.some((a) => a.name === auth.name) &&
                          'hidden'
                        }`}
                        onClick={() => {
                          if (!authorSelected.includes(auth)) {
                            form.setValue('author', [...authorSelected, auth]);
                            setAuthorSelected([...authorSelected, auth]);
                          }
                        }}
                      >
                        {auth.name}
                      </li>
                    ))
                  : !!authorInput && (
                      <li
                        className={`flex items-center gap-x-2 rounded-md ${
                          authorSelected.some((a) => a.name === authorInput) &&
                          'hidden'
                        }`}
                      >
                        Thêm:{' '}
                        <span
                          className="cursor-pointer p-1 bg-zinc-800"
                          onClick={() => {
                            if (
                              !authorSelected.some(
                                (a) => a.name === authorInput
                              )
                            ) {
                              form.setValue('author', [
                                ...authorSelected,
                                { id: -1, name: authorInput },
                              ]);
                              setAuthorSelected([
                                ...authorSelected,
                                { id: -1, name: authorInput },
                              ]);
                            }
                          }}
                        >
                          {authorInput}
                        </span>
                      </li>
                    )}
              </ul>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tag"
          render={() => (
            <FormItem>
              <FormLabel>Thể loại</FormLabel>
              <FormMessage />
              <Popover>
                <ul className="flex items-center gap-x-2">
                  {tagSelect.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-x-1 p-1 bg-zinc-800 rounded-md"
                    >
                      {t.name}
                      <span
                        onClick={() => {
                          const tagValue = [
                            ...tagSelect.filter((ta) => ta.name !== t.name),
                          ];
                          form.setValue('tag', tagValue);
                          setTagSelect(tagValue);
                        }}
                      >
                        <X className="h-5 w-5 text-red-500 cursor-pointer" />
                      </span>
                    </li>
                  ))}
                </ul>
                <PopoverTrigger className="w-full">
                  <FormControl>
                    <Input placeholder="Thể loại" />
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent>
                  <Command>
                    <CommandInput placeholder="Tìm thể loại" />
                    <CommandEmpty>Không tìm thấy</CommandEmpty>
                    <CommandList>
                      {tag.length &&
                        tag.map((t, idx) => (
                          <CommandGroup key={`${idx}`} heading={t.category}>
                            {t.data.map((d, idx) => (
                              <CommandItem
                                key={`${idx}`}
                                title={d.description}
                                className="cursor-pointer"
                                onSelect={(currVal) => {
                                  if (
                                    !tagSelect.some(
                                      (d) => d.name.toLowerCase() === currVal
                                    )
                                  ) {
                                    const tagValue = [
                                      ...tagSelect,
                                      ...t.data.filter(
                                        (t) => t.name.toLowerCase() === currVal
                                      ),
                                    ];
                                    form.setValue('tag', tagValue);
                                    setTagSelect(tagValue);
                                  } else {
                                    const tagValue = [
                                      ...tagSelect.filter(
                                        (t) => t.name.toLowerCase() !== currVal
                                      ),
                                    ];
                                    form.setValue('tag', tagValue);
                                    setTagSelect(tagValue);
                                  }
                                }}
                              >
                                <div
                                  className={cn(
                                    'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                    tagSelect.includes(d)
                                      ? 'bg-primary text-primary-foreground'
                                      : 'opacity-50 [&_svg]:invisible'
                                  )}
                                >
                                  <Check className="h-4 w-4" />
                                </div>
                                {d.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                <div className="max-md::max-w-[300px] max-w-[500px] xl:max-w-[800px] container">
                  <ReactQuill
                    theme="snow"
                    value={editorValue}
                    onChange={(value) => {
                      field.onChange(value);
                      setEditorValue(value);
                    }}
                  />
                </div>
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
