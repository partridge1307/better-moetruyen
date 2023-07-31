import ForceSignOut from '@/components/ForceSignOut';
import ChatSidebar from '@/components/Navbar/ChatSidebar';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');
  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
    },
  });
  if (!user) return <ForceSignOut />;

  const conversation = await db.user
    .findUnique({
      where: {
        id: user.id,
      },
    })
    .conversation({
      select: {
        id: true,
        createdAt: true,
        users: {
          where: {
            id: {
              not: user.id,
            },
          },
          select: {
            id: true,
            name: true,
            color: true,
            image: true,
          },
        },
      },
    });

  return (
    <main className="relative container max-sm:px-2 h-screen md:pb-4 pt-20">
      <div className="relative h-full w-full md:grid md:grid-cols-[.6fr_1fr] rounded dark:bg-zinc-700">
        <ChatSidebar
          conversation={conversation?.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          )}
        />
        {children}
      </div>
    </main>
  );
};

export default Layout;
