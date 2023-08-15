import { db } from '@/lib/db';
import dynmaic from 'next/dynamic';
const DataUserTable = dynmaic(
  () => import('@/components/Admin/Table/DataUserTable'),
  { ssr: false }
);

const Page = async () => {
  const verifyList = await db.verifyList.findMany({
    select: {
      userId: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="p-2 rounded-lg dark:bg-zinc-900/75">
      <DataUserTable data={verifyList} />
    </div>
  );
};

export default Page;
