import { db } from '@/lib/db';

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

  return <div className="p-2 rounded-lg dark:bg-zinc-900/75"></div>;
};

export default Page;
