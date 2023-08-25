import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import { List, ListTree } from 'lucide-react';

const ListTreeChapter = dynamic(
  () => import('@/components/Chapter/ListChapter/ListTreeChapter')
);
const ListChapter = dynamic(
  () => import('@/components/Chapter/ListChapter/ListChapter')
);

interface indexProps {
  mangaId: number;
}

const index: FC<indexProps> = ({ mangaId }) => {
  return (
    <Tabs defaultValue="list">
      <div className="md:w-full md:flex md:justify-end">
        <TabsList className="space-x-2 dark:bg-zinc-800 max-sm:grid max-sm:grid-cols-2">
          <TabsTrigger value="list">
            <List
              className="max-sm:w-5 max-sm:h-5"
              aria-label="List chapter button"
            />
          </TabsTrigger>
          <TabsTrigger value="group">
            <ListTree
              className="max-sm:w-5 max-sm:h-5"
              aria-label="List tree chapter button"
            />
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="group">
        <ListTreeChapter mangaId={mangaId} />
      </TabsContent>

      <TabsContent value="list">
        <ListChapter mangaId={mangaId} />
      </TabsContent>
    </Tabs>
  );
};

export default index;
