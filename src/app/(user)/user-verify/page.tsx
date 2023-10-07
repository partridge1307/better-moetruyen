import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

const UserVerifyForm = dynamic(
  () => import('@/components/Auth/UserVerifyForm'),
  { ssr: false }
);

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
      verified: false,
    },
    select: {
      id: true,
    },
  });
  if (!user) return notFound();

  return (
    <main className="container max-sm:px-2 md:w-3/4 space-y-10 p-2 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-2xl font-semibold">Xác thực người dùng</h1>

      <UserVerifyForm />
    </main>
  );
};

export default page;
