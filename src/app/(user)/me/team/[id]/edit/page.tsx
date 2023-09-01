import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';

const TeamEditForm = dynamic(() => import('@/components/Team/TeamEditForm'), {
  ssr: false,
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
      description: true,
    },
  });
  if (!team) return notFound();

  return <TeamEditForm team={team} />;
};

export default page;
