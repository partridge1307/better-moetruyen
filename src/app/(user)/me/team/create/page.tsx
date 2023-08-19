import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
const TeamCreateForm = dynamic(
  () => import('@/components/Team/TeamCreateForm'),
  { ssr: false }
);

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const team = await db.team.findFirst({
    where: {
      ownerId: session.user.id,
    },
  });
  if (team) return redirect('/me/team');

  return <TeamCreateForm />;
};

export default page;
