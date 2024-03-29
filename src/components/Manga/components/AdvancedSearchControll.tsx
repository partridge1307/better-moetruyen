'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Tags } from '@/lib/query';
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@mantine/hooks';
import { DialogClose } from '@radix-ui/react-dialog';
import { Filter, FilterX } from 'lucide-react';
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { FC, useCallback, useEffect, useState } from 'react';

interface AdvancedSearchControllProps {
  tags: Tags[];
  // eslint-disable-next-line no-unused-vars
  onQueryStrChange: (query: string) => void;
}

const OrderByArray: {
  sortByValue: string;
  content: string;
  order: ('asc' | 'desc')[];
}[] = [
  {
    sortByValue: 'createdAt',
    content: 'Ngày tạo',
    order: ['asc', 'desc'],
  },
  {
    sortByValue: 'name',
    content: 'Tên truyện',
    order: ['asc', 'desc'],
  },
  {
    sortByValue: 'view',
    content: 'Lượt xem',
    order: ['asc', 'desc'],
  },
  {
    sortByValue: 'followedBy',
    content: 'Theo dõi',
    order: ['asc', 'desc'],
  },
];

function getSearchParams(searchParams: ReadonlyURLSearchParams) {
  const sortByParams = searchParams.get('sortBy') ?? 'createdAt';
  const orderParams = searchParams.get('order') ?? 'desc';
  const includeParams = searchParams.get('include');
  const includeModeParams = searchParams.get('includeMode') ?? 'and';
  const excludeParams = searchParams.get('exclude');
  const excludeModeParams = searchParams.get('excludeMode') ?? 'or';
  const nameParams = searchParams.get('name') ?? '';
  const authorParams = searchParams.get('author') ?? '';
  const limitParams = searchParams.get('limit') ?? '10';

  return {
    sortByParams,
    orderParams,
    includeParams,
    includeModeParams,
    excludeParams,
    excludeModeParams,
    nameParams,
    authorParams,
    limitParams,
  };
}

const AdvancedSearchControll: FC<AdvancedSearchControllProps> = ({
  tags,
  onQueryStrChange,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    sortByParams,
    orderParams,
    includeParams,
    includeModeParams,
    excludeParams,
    excludeModeParams,
    nameParams,
    authorParams,
    limitParams,
  } = getSearchParams(searchParams);

  const [include, onIncludeChange] = useState(
    includeParams?.split(',').map(Number) ?? []
  );
  const [includeMode, onIncludeModeChange] = useState(includeModeParams);
  const [exclude, onExcludeChange] = useState(
    excludeParams?.split('.').map(Number) ?? []
  );
  const [excludeMode, onExcludeModeChange] = useState(excludeModeParams);
  const [sortBy, onSortChange] = useState(sortByParams);
  const [order, onOrderChange] = useState(orderParams);
  const [name, setName] = useState(nameParams);
  const [debouncedName] = useDebouncedValue(name, 500);
  const [author, setAuthor] = useState(authorParams);
  const [debouncedAuthor] = useDebouncedValue(author, 500);

  useEffect(() => {
    let query = `/advanced-search?includeMode=${includeMode}&excludeMode=${excludeMode}&sortBy=${sortBy}&order=${order}`;

    if (include.length) {
      query = `${query}&include=${include.join(',')}`;
    }

    if (exclude.length) {
      query = `${query}&exclude=${exclude.join(',')}`;
    }

    if (debouncedName.length) {
      query = `${query}&name=${debouncedName}`;
    }

    if (debouncedAuthor.length) {
      query = `${query}&author=${debouncedAuthor}`;
    }

    onQueryStrChange(query);
    return router.push(`${query}&limit=${limitParams}`);
  }, [
    include,
    includeMode,
    exclude,
    excludeMode,
    sortBy,
    order,
    debouncedName,
    debouncedAuthor,
    onQueryStrChange,
    router,
    limitParams,
  ]);

  const onTagFilter = useCallback(
    (id: number) => {
      if (!include.includes(id) && !exclude.includes(id)) {
        onIncludeChange((prev) => [...prev, id]);
        return;
      }
      if (!exclude.includes(id)) {
        onExcludeChange((prev) => [...prev, id]);
        onIncludeChange((prev) => prev.filter((includeId) => includeId !== id));
        return;
      }
      onIncludeChange((prev) => prev.filter((includeId) => includeId !== id));
      onExcludeChange((prev) => prev.filter((excludeId) => excludeId !== id));
    },
    [exclude, include]
  );

  const onTagReset = useCallback(() => {
    onIncludeChange([]);
    onExcludeChange([]);
  }, []);

  const onTagDone = useCallback(() => {
    let query = `/advanced-search?includeMode=${includeMode}&excludeMode=${excludeMode}&sortBy=${sortBy}&order=${order}`;

    if (include.length) {
      query = `${query}&include=${include.join(',')}`;
    }

    if (exclude.length) {
      query = `${query}&exclude=${exclude.join(',')}`;
    }

    if (debouncedName.length) {
      query = `${query}&name=${debouncedName}`;
    }

    if (debouncedAuthor.length) {
      query = `${query}&author=${debouncedAuthor}`;
    }

    return router.push(`${query}&limit=${limitParams}`);
  }, [
    debouncedAuthor,
    debouncedName,
    exclude,
    excludeMode,
    include,
    includeMode,
    limitParams,
    order,
    router,
    sortBy,
  ]);

  return (
    <section className="space-y-4 p-2 rounded-md dark:bg-zinc-900/60">
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <Input
          placeholder="Tên truyện"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Tên tác giả"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </div>

      <div className="flex justify-between items-center px-2">
        <Dialog>
          <DialogTrigger className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Lọc</span>
          </DialogTrigger>

          <DialogContent className="max-h-[100dvh] overflow-y-auto scrollbar dark:scrollbar--dark">
            <div className="flex flex-wrap items-center gap-4">
              <DialogClose
                className="p-2 rounded-md transition-colors bg-orange-600 hover:bg-orange-600/90"
                onClick={onTagDone}
              >
                Xong
              </DialogClose>
              <button
                type="button"
                aria-label="Reset filter button"
                className="flex items-center space-x-2 p-2 rounded-md transition-colors bg-primary-foreground hover:bg-primary-foreground/80"
                onClick={onTagReset}
              >
                <FilterX className="w-5 h-5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between">
              <div className="space-y-1">
                <label
                  htmlFor="include_mode_switch"
                  className="text-lg lg:text-xl font-semibold"
                >
                  Bao gồm
                </label>
                <div
                  id="include_mode_switch"
                  className="flex items-center gap-2"
                >
                  <span>Và</span>
                  <Switch
                    defaultChecked={includeMode === 'or' ? true : false}
                    onCheckedChange={(checked) =>
                      onIncludeModeChange(checked ? 'or' : 'and')
                    }
                  />
                  <span>Hoặc</span>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="exclude_mode_swtich"
                  className="text-lg lg:text-xl font-semibold"
                >
                  Loại trừ
                </label>
                <div
                  id="exclude_mode_switch"
                  className="flex items-center gap-2"
                >
                  <span>Và</span>
                  <Switch
                    defaultChecked={excludeMode === 'or' ? true : false}
                    onCheckedChange={(checked) =>
                      onExcludeModeChange(checked ? 'or' : 'and')
                    }
                  />
                  <span>Hoặc</span>
                </div>
              </div>
            </div>

            {tags.map((category, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-lg lg:text-xl font-semibold">
                  {category.category}
                </p>

                <div className="flex flex-wrap gap-4">
                  {category.data.map((tag) => (
                    <button
                      key={tag.id}
                      title={tag.description}
                      aria-label={`${tag.name} tag`}
                      className={cn('p-1 px-2 rounded-md bg-muted', {
                        'bg-orange-600': include.includes(tag.id),
                        'bg-red-600': exclude.includes(tag.id),
                      })}
                      onClick={() => onTagFilter(tag.id)}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </DialogContent>
        </Dialog>

        <Select
          defaultValue={`${sortByParams}.${orderParams}`}
          onValueChange={(value) => {
            const splittedValue = value.split('.');
            onSortChange(splittedValue[0]);
            onOrderChange(splittedValue[1]);
          }}
        >
          <SelectTrigger className="w-fit border-none focus:ring-transparent ring-offset-transparent">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {OrderByArray.map((sortBy) =>
              sortBy.order.map((orderBy, index) => (
                <SelectItem
                  ref={(ref) => {
                    if (!ref) return;
                    ref.ontouchstart = (e) => {
                      e.preventDefault();
                    };
                  }}
                  key={index}
                  value={`${sortBy.sortByValue}.${orderBy}`}
                  className="hover:cursor-pointer"
                  aria-label={`${sortBy.sortByValue} ${orderBy}`}
                >
                  {sortBy.content} {orderBy === 'asc' ? 'tăng dần' : 'giảm dần'}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
};

export default AdvancedSearchControll;
