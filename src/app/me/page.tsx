import ForceSignOut from '@/components/ForceSignOut';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
const UserProfile = dynamic(() => import('@/components/User/UserProfile'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});

interface pageProps {}

const page: FC<pageProps> = async ({}) => {
  const session = await getAuthSession();
  if (!session) return notFound();

  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
    include: {
      badge: true,
    },
  });
  if (!user) return <ForceSignOut />;

  return <UserProfile user={user} />;
};

export default page;
