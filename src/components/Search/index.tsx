'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { useDebouncedValue } from '@mantine/hooks';
import type { Manga, MangaAuthor, SubForum, User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Search as SearchIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Input } from '../ui/Input';
import { Sheet, SheetContent, SheetTrigger } from '../ui/Sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

const MangaSearch = dynamic(() => import('@/components/Search/MangaSearch'), {
  ssr: false,
});
const UserSearch = dynamic(() => import('@/components/Search/UserSearch'), {
  ssr: false,
});
const ForumSearch = dynamic(() => import('@/components/Search/ForumSearch'), {
  ssr: false,
});
const SearchSkeleton = dynamic(
  () => import('@/components/Search/SearchSkeleton')
);

export type SearchData = {
  mangas: (Pick<Manga, 'id' | 'slug' | 'image' | 'name' | 'review'> & {
    author: Pick<MangaAuthor, 'name'>[];
  })[];
  users: Pick<User, 'name' | 'color' | 'image'>[];
  forums: Pick<SubForum, 'title' | 'slug' | 'banner'>[];
};

const Index = () => {
  const [query, setQuery] = useState('');
  const [debouncedValue] = useDebouncedValue(query, 300);
  const { serverErrorToast } = useCustomToast();

  const {
    data: searchData,
    mutate: Search,
    isLoading: isSearching,
  } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.get(`/api/search?q=${debouncedValue}`);

      return data as SearchData;
    },
    onError: () => {
      return serverErrorToast();
    },
  });

  useEffect(() => {
    if (debouncedValue.length) {
      Search();
    }
  }, [Search, debouncedValue]);

  return (
    <Sheet>
      <SheetTrigger>
        <SearchIcon className="w-7 h-7" aria-label="Search button" />
      </SheetTrigger>

      <SheetContent side={'top'} className="p-2">
        <form action={`/search/`} method="GET">
          <Input
            name="q"
            autoComplete="off"
            placeholder="Tìm kiếm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-zinc-800"
          />
        </form>

        {isSearching && !!debouncedValue.length && <SearchSkeleton />}

        {!isSearching && !debouncedValue.length && (
          <p className="mt-6 px-1">Nhập nội dung bạn muốn tìm kiếm</p>
        )}

        {!isSearching && !!debouncedValue.length && (
          <Tabs defaultValue="manga" className="mt-6">
            <TabsList>
              <TabsTrigger value="manga">Manga</TabsTrigger>
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="forum">Forum</TabsTrigger>
            </TabsList>

            <TabsContent value="manga">
              <MangaSearch mangas={searchData?.mangas} />
            </TabsContent>

            <TabsContent value="user">
              <UserSearch users={searchData?.users} />
            </TabsContent>

            <TabsContent value="forum">
              <ForumSearch forums={searchData?.forums} />
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Index;
