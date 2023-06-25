import { FC } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import MangaUploadCard from './MangaUploadCard';
import { Manga } from '@prisma/client';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/ContextMenu';
import { Plus, Settings2, UploadCloud } from 'lucide-react';
import Link from 'next/link';

interface MangaUploadManageProps {
  manga: Array<Manga>;
}

const MangaUploadManage: FC<MangaUploadManageProps> = ({ manga }) => {
  const published = manga.filter((m) => m.isPublished);
  const notPublished = manga.filter((m) => !m.isPublished);

  return (
    <Tabs defaultValue="published">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="published">Đã publish</TabsTrigger>
        <TabsTrigger value="notPublished">Chờ publish</TabsTrigger>
      </TabsList>

      <TabsContent
        value="notPublished"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {notPublished &&
          notPublished.map((m) => (
            <ContextMenu key={m.id}>
              <ContextMenuTrigger>
                <MangaUploadCard key={m.id} manga={m} />
              </ContextMenuTrigger>
              <ContextMenuContent className="bg-zinc-900 text-slate-50">
                <ContextMenuItem className="flex gap-x-1" asChild>
                  <Link href={`/me/manga/${m.id}/chapter`}>
                    <Plus className="h-4 w-4" />
                    <p>Thêm chap</p>
                  </Link>
                </ContextMenuItem>
                <ContextMenuItem className="flex gap-x-1" asChild>
                  <Link href={`/me/manga/${m.id}`}>
                    <Settings2 className="h-4 w-4" />
                    <p>Sửa</p>
                  </Link>
                </ContextMenuItem>
                <ContextMenuItem className="flex gap-x-1" asChild>
                  <Link href={`/me/manga/${m.id}`}>
                    <UploadCloud className="h-4 w-4" />
                    <p>Publish</p>
                  </Link>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
      </TabsContent>
    </Tabs>
  );
};

export default MangaUploadManage;
