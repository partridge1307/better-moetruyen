import CommentSkeleton from '@/components/Skeleton/CommentSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { getAuthSession } from '@/lib/auth';
import type { Manga } from '@prisma/client';
import { ChevronDown, List, ListTree, MessagesSquare } from 'lucide-react';
import dynamic from 'next/dynamic';
import { FC } from 'react';

const Normal = dynamic(() => import('./Normal'), {
  loading: () => <NormalSkeleton />,
});
const Tree = dynamic(() => import('./Tree'), {
  loading: () => <TreeSkeleton />,
});
const Comments = dynamic(() => import('@/components/Comment/Manga'), {
  ssr: false,
  loading: () => <CommentSkeleton />,
});

interface ChapterListProps {
  manga: Pick<Manga, 'id'>;
}

const ChapterList: FC<ChapterListProps> = async ({ manga }) => {
  const session = await getAuthSession();

  return (
    <Tabs defaultValue="normal" className="space-y-4">
      <TabsList>
        <TabsTrigger
          aria-label="manga chapters normal style"
          value="normal"
          className="w-20"
        >
          <List />
        </TabsTrigger>
        <TabsTrigger
          aria-label="manga chapters tree list style"
          value="tree"
          className="w-20"
        >
          <ListTree />
        </TabsTrigger>
        <TabsTrigger
          aria-label="manga comments"
          value="comment"
          className="w-20"
        >
          <MessagesSquare />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="normal">
        <Normal mangaId={manga.id} />
      </TabsContent>

      <TabsContent value="tree">
        <Tree mangaId={manga.id} />
      </TabsContent>

      <TabsContent
        value="comment"
        forceMount
        className='data-[state="inactive"]:hidden space-y-12'
      >
        <Comments id={manga.id} session={session} />
      </TabsContent>
    </Tabs>
  );
};

export default ChapterList;

function NormalSkeleton({ length = 20 }: { length?: number }) {
  return (
    <div className="space-y-3">
      {Array.from(Array(length).keys()).map((_, idx) => (
        <div key={idx} className="flex gap-2 md:gap-4">
          <div className="flex-1 h-16 rounded-md animate-pulse bg-muted" />
          {idx % 2 === 0 && (
            <div
              className="rounded-md animate-pulse bg-muted"
              style={{
                width: `${Math.floor(Math.random() * (idx / 2)) + 5}rem`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function TreeSkeleton() {
  return Array.from(Array(3).keys()).map((_, idx) => (
    <div key={idx} className="pb-4 border-b border-muted">
      <div className="flex justify-between py-4">
        <p
          className="h-4 rounded-full bg-muted"
          style={{ width: `${Math.floor(Math.random() * idx) + 5}rem` }}
        />
        <ChevronDown className="w-4 h-4" />
      </div>
      <NormalSkeleton length={idx + 1} />
    </div>
  ));
}
