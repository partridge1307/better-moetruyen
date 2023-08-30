import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { notFound, redirect } from 'next/navigation';
const UserProfile = dynamic(() => import('@/components/User/UserProfile'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      badge: true,
      name: true,
      color: true,
      image: true,
      banner: true,
    },
  });
  if (!user) return notFound();

  return <UserProfile user={user} />;
};

export default page;
