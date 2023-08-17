import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
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
  if (!session) return redirect('/sign-in');

  const team = await db.team.findFirst({
    where: {
      id: +params.id,
      ownerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });
  if (!team) return notFound();

  return <TeamEdit team={team} />;
};

export default page;
