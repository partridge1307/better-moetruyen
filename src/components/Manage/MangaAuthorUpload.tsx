import type {
  MangaUploadPayload,
  authorInfoProps,
} from '@/lib/validators/upload';
import { Loader2, X } from 'lucide-react';
import { FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/Form';
import { Input } from '../ui/Input';

export type authorResultProps = {
  author: authorInfoProps[];
};

interface MangaAuthorUploadProps {
  form: UseFormReturn<MangaUploadPayload>;
  authorSelected: authorInfoProps[];
  setAuthorSelected: React.Dispatch<React.SetStateAction<authorInfoProps[]>>;
  authorInput: string;
  setAuthorInput: (value: string) => void;
  isFetchingAuthor: boolean;
  authorResult?: authorResultProps;
}

const MangaAuthorUpload: FC<MangaAuthorUploadProps> = ({
  form,
  authorSelected,
  setAuthorSelected,
  authorInput,
  setAuthorInput,
  isFetchingAuthor,
  authorResult,
}) => {
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
                defaultValue={authorInput}
                onChange={(e) => {
                  setAuthorInput(e.target.value);
                }}
                className="border-none focus:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-transparent"
              />
            </div>
          </FormControl>
          <ul className="flex items-center">
            {isFetchingAuthor && <Loader2 className="h-4 w-4 animate-spin" />}
            {!isFetchingAuthor && authorResult?.author.length
              ? authorResult.author.map((auth) => (
                  <li
                    key={auth.id}
                    className={`cursor-pointer rounded-md bg-slate-800 p-1 ${
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
                      className="cursor-pointer bg-zinc-800 p-1"
                      onClick={() => {
                        if (
                          !authorSelected.some((a) => a.name === authorInput)
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
  );
};

export default MangaAuthorUpload;
