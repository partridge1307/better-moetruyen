import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
const BadgeModifier = dynamic(
  () => import('@/components/Admin/BadgeModifier'),
  { ssr: false }
);

const page = async ({ params }: { params: { id: string } }) => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const [user, badge] = await db.$transaction([
    db.user.findFirst({
      where: {
        id: session.user.id,
        role: 'ADMIN',
      },
    }),
    db.badge.findFirst({ where: { id: +params.id } }),
  ]);
  if (!user || !badge) return notFound();

  return <BadgeModifier badge={badge} />;
};

export default page;
