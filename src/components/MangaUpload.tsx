import { FC } from 'react';
import MangaUploadForm from './MangaUploadForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';

interface MangaUploadProps {
  manga: object[];
  tag: object[];
}

const MangaUpload: FC<MangaUploadProps> = ({ manga, tag }) => {
  return (
    <Tabs defaultValue="manage" className="bg-zinc-700 rounded-lg px-2 py-4">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="manage">Quản lý</TabsTrigger>
        <TabsTrigger value="upload">Đăng truyện</TabsTrigger>
      </TabsList>

      <TabsContent value="manage">
        {!manga.length ? (
          <p>Bạn chưa upload bộ nào mất rồi. Hãy upload một bộ ngay thôi nhé</p>
        ) : (
          <></>
        )}
      </TabsContent>
      <TabsContent value="upload">
        <MangaUploadForm tag={tag} />
      </TabsContent>
    </Tabs>
  );
};

export default MangaUpload;
