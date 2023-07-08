import ForceSignOut from '@/components/ForceSignOut';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { tagGroupByCategory } from '@/lib/query';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { FC } from 'react';
const MangaUpload = dynamic(() => import('@/components/Manage/MangaUpload'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});

interface pageProps {}

const page: FC<pageProps> = async ({}) => {
  const session = await getAuthSession();
  if (!session) return <ForceSignOut />;
  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
  });
  if (!user) return <ForceSignOut />;

  const tag = await tagGroupByCategory();

  return <MangaUpload tag={tag} />;
};

export default page;
