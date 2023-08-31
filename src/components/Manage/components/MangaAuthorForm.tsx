'use client';

import type {
  MangaUploadPayload,
  authorInfoProps,
} from '@/lib/validators/manga';
import { useDebouncedValue } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, X } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/Form';
import { Input } from '../../ui/Input';

type authorResultProps = {
  author: authorInfoProps[];
};

interface MangaAuthorFormProps {
  form: UseFormReturn<MangaUploadPayload>;
  existAuthors?: authorInfoProps[];
}

const MangaAuthorForm: FC<MangaAuthorFormProps> = ({ form, existAuthors }) => {
  const [authorInput, setAuthorInput] = useState('');
  const [debouncedValue] = useDebouncedValue(authorInput, 300);
  const [authorSelected, setAuthorSelected] = useState<authorInfoProps[]>(
    existAuthors ?? []
  );

  const {
    data: authorsResult,
    refetch,
    isFetching: isFetchingAuthor,
  } = useQuery({
    queryKey: ['fetch-author'],
    enabled: false,
    queryFn: async () => {
      const { data } = await axios.get(`/api/manga/author?q=${debouncedValue}`);

      return data as authorResultProps;
    },
  });

  useEffect(() => {
    if (debouncedValue.length) {
      refetch();
    }
  }, [debouncedValue.length, refetch]);

  return (
    <FormField
      control={form.control}
      name="author"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tác giả</FormLabel>
          <FormMessage />
          <FormControl>
            <div className="rounded-lg border px-2 py-1">
              <ul className="flex gap-x-2">
                {authorSelected.map((auth) => (
                  <li
                    key={auth.id}
                    className="flex items-center gap-x-1 rounded-md bg-zinc-800 p-1"
                  >
                    <span>{auth.name}</span>
                    <X
                      className="h-5 w-5 cursor-pointer text-red-500"
                      onClick={() => {
                        const authorVal = [
                          ...authorSelected.filter((a) => a.name !== auth.name),
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
                  setAuthorInput(e.target.value.trim());
                }}
                className="border-none focus:ring-0 focus-visible:ring-transparent ring-offset-transparent"
              />
            </div>
          </FormControl>
          <ul className="flex flex-wrap items-center gap-2">
            {isFetchingAuthor ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              !!authorInput.length && (
                <li
                  className={`flex items-center gap-x-2 rounded-md ${
                    authorSelected.some((a) => a.name === authorInput) &&
                    'hidden'
                  }`}
                >
                  Thêm:{' '}
                  <span
                    className="cursor-pointer bg-zinc-800 p-1"
                    onClick={() => {
                      if (!authorSelected.some((a) => a.name === authorInput)) {
                        form.setValue('author', [
                          ...authorSelected,
                          { id: -1, name: authorInput },
                        ]);
                        setAuthorSelected([
                          ...authorSelected,
                          { id: -1, name: authorInput },
                        ]);
                        setAuthorInput('');
                      }
                    }}
                  >
                    {authorInput}
                  </span>
                </li>
              )
            )}

            {!isFetchingAuthor &&
              !!authorsResult?.author.length &&
              !!authorInput.length &&
              authorsResult.author.map((auth) => (
                <li
                  key={auth.id}
                  className={`cursor-pointer rounded-md bg-slate-800 p-1 ${
                    authorSelected.some((a) => a.name === auth.name) && 'hidden'
                  }`}
                  onClick={() => {
                    if (!authorSelected.includes(auth)) {
                      form.setValue('author', [...authorSelected, auth]);
                      setAuthorSelected([...authorSelected, auth]);
                      setAuthorInput('');
                    }
                  }}
                >
                  {auth.name}
                </li>
              ))}
          </ul>
        </FormItem>
      )}
    />
  );
};

export default MangaAuthorForm;
