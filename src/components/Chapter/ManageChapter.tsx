import { FC } from 'react';
import { Chapter } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import ChapterUploadForm from './ChapterUploadForm';

interface ManageChapterProps {
  chapter: Array<Chapter>;
  mangaId: string;
}

const ManageChapter: FC<ManageChapterProps> = ({ chapter, mangaId }) => {
  console.log(chapter);

  return (
    <Tabs defaultValue="chapter">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="chapter">Chapter</TabsTrigger>
        <TabsTrigger value="uploadChapter">Thêm chapter</TabsTrigger>
      </TabsList>
      <TabsContent value="chapter">
        {!chapter.length ? (
          <p>Bạn chưa có chapter nào cả. Hãy thêm ngay một chapter nhé.</p>
        ) : (
          <></>
        )}
      </TabsContent>
      <TabsContent value="uploadChapter">
        <ChapterUploadForm mangaId={mangaId} />
      </TabsContent>
    </Tabs>
  );
};

export default ManageChapter;
