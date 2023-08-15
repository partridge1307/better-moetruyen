import { db } from '@/lib/db';
import Link from 'next/link';

const Page = async () => {
  const users = await db.user.findMany({
    where: {
      OR: [
        {
          role: 'ADMIN',
        },
        {
          role: 'MOD',
        },
      ],
    },
    select: {
      id: true,
      name: true,
      role: true,
    },
  });

  return (
    <div className="containter max-sm:px-2 p-2 rounded-lg dark:bg-zinc-900 space-y-10">
      <div className="space-y-2">
        <h1 className="font-medium">ADMIN</h1>
        <ul className="flex flex-wrap gap-4">
          {users
            .filter((user) => user.role === 'ADMIN')
            .map((user, idx) => (
              <li key={idx} className="p-2 dark:bg-zinc-700 rounded-lg">
                <Link href={`/user/${user.id}`}>
                  <p className="text-lg">{user.name}</p>
                  <p className="text-sm">
                    <span>ID:</span> {user.id}
                  </p>
                </Link>
              </li>
            ))}
        </ul>
      </div>

      <div className="space-y-2">
        <h1 className="font-medium">MOD</h1>
        <ul className="flex flex-wrap gap-4">
          {users
            .filter((user) => user.role === 'MOD')
            .map((user, idx) => (
              <li key={idx} className="p-2 dark:bg-zinc-700 rounded-lg">
                <Link href={`/user/${user.id}`}>
                  <p className="text-lg">{user.name}</p>
                  <p className="text-sm">
                    <span>ID:</span> {user.id}
                  </p>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default Page;
