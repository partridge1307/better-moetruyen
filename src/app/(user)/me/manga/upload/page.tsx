import { getAuthSession } from '@/lib/auth';
import { tagGroupByCategory } from '@/lib/query';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { FC } from 'react';
const MangaUpload = dynamic(() => import('@/components/Manage/MangaUpload'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});

interface pageProps {}

const page: FC<pageProps> = async ({}) => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const tag = await tagGroupByCategory();

  return <MangaUpload tag={tag} />;
};

export default page;
