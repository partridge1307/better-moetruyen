'use client';

import { ExtendedTags } from '@/app/(manga)/advanced-search/page';
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@mantine/hooks';
import { DialogClose } from '@radix-ui/react-dialog';
import { Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Button, buttonVariants } from '../ui/Button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';
import { Switch } from '../ui/Switch';

interface AdvancedSearchControllProps {
  tags: ExtendedTags[];
  orderBy: string;
}

const AdvancedSearchControll: FC<AdvancedSearchControllProps> = ({
  tags,
  orderBy,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tagsChoice, setTagsChoice] = useState(tags);
  const [include, setInclude] = useState<number[]>([]);
  const [exclude, setExclude] = useState<number[]>([]);
  const query = useRef<string>('');
  const [mangaNameInputValue, setMangaNameInputValue] = useState('');
  const [debouncedMangaNameValue] = useDebouncedValue(mangaNameInputValue, 300);
  const [authorNameInputValue, setAuthorNameInputValue] = useState('');
  const [debouncedAuthorNameValue] = useDebouncedValue(
    authorNameInputValue,
    300
  );
  const [orderValue, setOrderValue] = useState<string>(orderBy);

  const includeModeParam = searchParams.get('include_mode') ?? 'and';
  const excludeModeParam = searchParams.get('exclude_mode') ?? 'or';

  const [includeMode, setIncludeMode] = useState<boolean>(
    includeModeParam === 'or'
  );
  const [excludeMode, setExcludeMode] = useState<boolean>(
    excludeModeParam === 'or'
  );

  useEffect(() => {
    const include = tagsChoice
      .flatMap((tc) => tc.data.filter((d) => d.choice === 1))
      .map((inc) => inc.id);

    const exclude = tagsChoice
      .flatMap((tc) => tc.data.filter((d) => d.choice === 2))
      .map((ex) => ex.id);

    setInclude(include);
    setExclude(exclude);
  }, [setExclude, setInclude, tagsChoice]);

  useEffect(() => {
    if (debouncedMangaNameValue.length) {
      let splittedQuery = query.current.split('&');
      splittedQuery = splittedQuery.filter((q) => !q.startsWith('query_name'));

      query.current = `${splittedQuery.join(
        '&'
      )}&query_name=${debouncedMangaNameValue}`;
    }

    if (debouncedAuthorNameValue.length) {
      let splittedQuery = query.current.split('&');
      splittedQuery = splittedQuery.filter(
        (q) => !q.startsWith('query_author')
      );

      query.current = `${splittedQuery.join(
        '&'
      )}&query_author=${debouncedMangaNameValue}`;
    }

    router.push(
      `/advanced-search?${
        query.current.charAt(0) === '&' ? query.current.slice(1) : query.current
      }`
    );
  }, [debouncedAuthorNameValue, debouncedMangaNameValue, router]);

  const onDoneHandler = useCallback(() => {
    query.current = '';
    !!include.length && (query.current = `&include=${include.join(',')}`);
    !!exclude.length &&
      (query.current = `${query.current}&exclude=${exclude.join(',')}`);

    query.current = `${query.current}&include_mode=${
      includeMode === true ? 'or' : 'and'
    }&exclude_mode=${excludeMode === true ? 'or' : 'and'}&order=${orderValue}`;

    router.push(
      `/advanced-search?${
        query.current.charAt(0) === '&' ? query.current.slice(1) : query.current
      }`
    );
  }, [exclude, excludeMode, include, includeMode, orderValue, query, router]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-8">
        <div className="flex-1 flex max-sm:flex-col items-center gap-2">
          <Input
            placeholder="Nhập tên truyện"
            value={mangaNameInputValue}
            onChange={(e) => setMangaNameInputValue(e.target.value)}
            onBlur={(e) => setMangaNameInputValue(e.target.value)}
            className="dark:bg-zinc-900"
          />
          <Input
            placeholder="Nhập tên tác giả"
            value={authorNameInputValue}
            onChange={(e) => setAuthorNameInputValue(e.target.value)}
            onBlur={(e) => setAuthorNameInputValue(e.target.value)}
            className="dark:bg-zinc-900"
          />
        </div>
        <Dialog>
          <DialogTrigger className="flex items-center gap-1">
            <Filter className="w-5 h-5" />
            Lọc
          </DialogTrigger>

          <DialogContent className="dark:bg-zinc-900">
            <DialogTitle>Lọc</DialogTitle>

            <div className="flex items-center gap-4">
              <DialogClose
                className={cn(
                  buttonVariants(),
                  'bg-orange-500 hover:bg-orange-700 text-white w-20'
                )}
                onClick={() => onDoneHandler()}
              >
                Xong
              </DialogClose>
              <Button
                variant={'ghost'}
                onClick={() => {
                  setTagsChoice((prev) =>
                    prev.map((tag) => ({
                      category: tag.category,
                      data: tag.data.map((d) => ({
                        choice: 0,
                        id: d.id,
                        name: d.name,
                        description: d.description,
                      })),
                    }))
                  );
                  setInclude([]);
                  setExclude([]);
                }}
              >
                Làm mới
              </Button>
            </div>

            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <Label htmlFor="include-mode" className="font-semibold">
                  Chế độ thêm Tag
                </Label>
                <div
                  id="include-mode"
                  className="flex items-center gap-2 text-sm"
                >
                  <p>Và</p>
                  <Switch
                    checked={includeMode}
                    onCheckedChange={(checked) => setIncludeMode(checked)}
                  />
                  <p>Hoặc</p>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="exclude-mode" className="font-semibold">
                  Chế độ loại Tag
                </Label>
                <div
                  id="exclude-mode"
                  className="flex items-center gap-2 text-sm"
                >
                  <p>Và</p>
                  <Switch
                    checked={excludeMode}
                    onCheckedChange={(checked) => setExcludeMode(checked)}
                  />
                  <p>Hoặc</p>
                </div>
              </div>
            </div>

            <ul className="space-y-3">
              {!!tagsChoice.length &&
                tagsChoice.map((tag, idx) => (
                  <li key={idx} className="space-y-1">
                    <h3 className="text-lg font-semibold">{tag.category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {!!tag.data.length &&
                        tag.data.map((t, i) => (
                          <div
                            key={i}
                            title={t.description}
                            className={cn(
                              'p-1 px-2 rounded-lg cursor-pointer select-none',
                              {
                                'dark:bg-zinc-800': t.choice === 0,
                                'bg-orange-500': t.choice === 1,
                                'bg-red-500': t.choice === 2,
                              }
                            )}
                            onClick={() => {
                              const target = tagsChoice
                                .flatMap((tc) => tc.data)
                                .find((d) => d.id === t.id);
                              if (!target) return;

                              const targetClone = target;
                              targetClone.choice === 0
                                ? (targetClone.choice = 1)
                                : targetClone.choice === 1
                                ? (targetClone.choice = 2)
                                : (targetClone.choice = 0);

                              const newState = tagsChoice.map((tc) => {
                                const index = tc.data.indexOf(target);
                                if (index === -1) return tc;

                                tc.data[index] = targetClone;
                                return tc;
                              });

                              setTagsChoice(newState);
                            }}
                          >
                            {t.name}
                          </div>
                        ))}
                    </div>
                  </li>
                ))}
            </ul>
          </DialogContent>
        </Dialog>
      </div>

      <Select value={orderValue} onValueChange={setOrderValue}>
        <SelectTrigger className="w-fit dark:bg-zinc-900/40">
          <SelectValue />
        </SelectTrigger>

        <SelectContent className="p-1 dark:bg-zinc-900">
          <SelectItem value="name.asc" className="p-2 cursor-pointer">
            Tên tăng dần
          </SelectItem>
          <SelectItem value="name.desc" className="p-2 cursor-pointer">
            Tên giảm dần
          </SelectItem>
          <SelectItem value="mangaFollow.asc" className="p-2 cursor-pointer">
            Theo dõi tăng dần
          </SelectItem>
          <SelectItem value="mangaFollow.desc" className="p-2 cursor-pointer">
            Theo dõi giảm dần
          </SelectItem>
          <SelectItem value="createdAt.asc" className="p-2 cursor-pointer">
            Ngày tạo tăng dần
          </SelectItem>
          <SelectItem value="createdAt.desc" className="p-2 cursor-pointer">
            Ngày tạo giảm dần
          </SelectItem>
          <SelectItem value="view.asc" className="p-2 cursor-pointer">
            Lượt xem tăng dần
          </SelectItem>
          <SelectItem value="view.desc" className="p-2 cursor-pointer">
            Lượt xem giảm dần
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AdvancedSearchControll;
