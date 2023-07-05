import MangaUpload from '@/components/Manage/MangaUpload';
import { db } from '@/lib/db';
import { tagGroupByCategory } from '@/lib/query';
import { FC } from 'react';

interface pageProps {}

const page: FC<pageProps> = async ({}) => {
  const tag = await tagGroupByCategory();

  return <MangaUpload tag={tag} />;
};

export default page;
