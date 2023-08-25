import ThreadSkeleton from '@/components/Forum/components/ThreadSkeleton';
import { getAuthSession } from '@/lib/auth';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';

const CreateThreadForm = dynamic(
  () => import('@/components/Forum/CreateThreadForm'),
  { ssr: false, loading: () => <ThreadSkeleton /> }
);

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  return (
    <section className="container max-sm:px-2 pt-20">
      <div className="p-2 space-y-4 rounded-md dark:bg-zinc-900/70">
        <h1 className="text-xl font-medium p-2">Tạo cộng đồng</h1>

        <hr className="dark:bg-zinc-700 rounded-full h-[2px]" />

        <CreateThreadForm />
      </div>
    </section>
  );
};

export default page;
