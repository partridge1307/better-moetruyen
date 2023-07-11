import ForceSignOut from '@/components/ForceSignOut';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
const TeamEdit = dynamic(() => import('@/components/Manage/TeamEdit'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});

interface pageProps {
  params: {
    id: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const session = await getAuthSession();
  if (!session) return notFound();

  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
  });
  if (!user) return <ForceSignOut />;

  const team = await db.team.findFirst({
    where: {
      id: +params.id,
      ownerId: user.id,
    },
  });
  if (!team) return notFound();

  return <TeamEdit team={team} />;
};

export default page;
