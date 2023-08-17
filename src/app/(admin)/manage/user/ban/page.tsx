import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { notFound, redirect } from 'next/navigation';
const Ban = dynamic(() => import('@/components/Admin/Ban'), { ssr: false });

const Page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect('/');

  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
      role: 'ADMIN',
    },
    select: {
      id: true,
    },
  });
  if (!user) return notFound();

  return <Ban />;
};

export default Page;
