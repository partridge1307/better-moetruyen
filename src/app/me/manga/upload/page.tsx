import MangaUpload from '@/components/Manage/MangaUpload';
import { db } from '@/lib/db';
import { FC } from 'react';

interface pageProps {}

const page: FC<pageProps> = async ({}) => {
  const tag = await db.tag.findMany();

  return <MangaUpload tag={tag} />;
};

export default page;
