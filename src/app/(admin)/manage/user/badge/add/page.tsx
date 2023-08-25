import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
const BadgeModifier = dynamic(
  () => import('@/components/Admin/BadgeModifier'),
  { ssr: false }
);

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
      role: 'ADMIN',
    },
  });
  if (!user) return notFound();

  return <BadgeModifier />;
};

export default page;