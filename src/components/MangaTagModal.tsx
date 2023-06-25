import { groupBy } from '@/lib/utils';
import { CommandEmpty } from 'cmdk';
import { X } from 'lucide-react';
import { FC, useState } from 'react';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/Command';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/Form';
import { Input } from './ui/Input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/Popover';

interface MangaTagModalProps {
  tag: object[];
  form: any;
}

const MangaTagModal: FC<MangaTagModalProps> = ({ tag, form }) => {
  const [tags, setTag] = useState<Array<string>>([]);

  return (
    <FormItem>
      <FormMessage />
      <FormLabel>Thể loại</FormLabel>
      <Popover>
        <div className="flex flex-wrap items-center py-2 px-1 w-full border rounded-md">
          <ul className="flex flex-wrap gap-2">
            {tags &&
              tags.map((t, i) => (
                <li
                  key={t}
                  className="flex items-center gap-2 p-2 bg-zinc-800 rounded-md"
                >
                  <span className="capitalize">{t}</span>
                  <span
                    onClick={() => {
                      setTag([...tags.filter((t, index) => index !== i)]);
                      form.setValue('tag', [
                        ...tags.filter((t, index) => index !== i),
                      ]);
                    }}
                  >
                    <X className="h-5 w-5 text-red-500" />
                  </span>
                </li>
              ))}
          </ul>
          <PopoverTrigger asChild>
            <FormControl>
              <Input className="border-none" />
            </FormControl>
          </PopoverTrigger>
        </div>

        <PopoverContent className="bg-zinc-800" align="end">
          <Command className="bg-zinc-800 text-slate-50">
            <CommandInput placeholder="Thể loại" />
            <CommandEmpty>Không tìm thấy thể loại</CommandEmpty>
            <CommandList className="max-h-60">
              {tag &&
                Object.entries(groupBy(tag, (tag: any) => tag.category)).map(
                  ([key, value]) => (
                    <CommandGroup
                      key={key}
                      heading={key}
                      className="text-slate-50"
                    >
                      {value.map((v) => (
                        <CommandItem
                          key={v.id}
                          title={v.description}
                          onSelect={(currentVal) => {
                            if (!tags.includes(currentVal)) {
                              setTag((prev) => [...prev, currentVal]);
                              form.setValue('tag', [...tags, currentVal]);
                            }
                          }}
                        >
                          {v.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )
                )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormDescription>Hãy mô tả truyện bạn muốn upload</FormDescription>
    </FormItem>
  );
};

export default MangaTagModal;
