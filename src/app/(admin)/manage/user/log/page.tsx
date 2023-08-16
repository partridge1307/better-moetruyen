import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatTimeToNow } from '@/lib/utils';
import { notFound, redirect } from 'next/navigation';

const Page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const [user, logs] = await db.$transaction([
    db.user.findFirst({ where: { id: session.user.id, role: 'ADMIN' } }),
    db.log.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);
  if (!user) return notFound();

  return (
    <ul className="p-2 rounded-md flex flex-col gap-2 max-h-full overflow-auto dark:bg-zinc-900/70">
      {!!logs.length ? (
        logs.map((log, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <p className="text-sm">
              {formatTimeToNow(new Date(log.createdAt))}
            </p>
            <span>-</span>
            <p>{log.content}</p>
          </li>
        ))
      ) : (
        <li>không có log</li>
      )}
    </ul>
  );
};

export default Page;
