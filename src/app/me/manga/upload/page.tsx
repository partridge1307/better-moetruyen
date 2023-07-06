import MangaUpload from '@/components/Manage/MangaUpload';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { tagGroupByCategory } from '@/lib/query';
import { redirect } from 'next/navigation';
import { FC } from 'react';

interface pageProps {}

const page: FC<pageProps> = async ({}) => {
  const session = await getAuthSession();
  if (!session) redirect('/sign-in');
  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
  });
  if (!user) return redirect('/sign-in');

  const tag = await tagGroupByCategory();

  return <MangaUpload tag={tag} />;
};

export default page;
