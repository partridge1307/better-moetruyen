import ForceSignOut from '@/components/ForceSignOut';
import ChatSidebar from '@/components/Navbar/ChatSidebar';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const [user, conversation] = await db.$transaction([
    db.user.findFirst({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
      },
    }),
    db.user
      .findUnique({
        where: {
          id: session.user.id,
        },
      })
      .conversation({
        select: {
          id: true,
          createdAt: true,
          users: {
            where: {
              id: {
                not: session.user.id,
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
      }),
  ]);
  if (!user) return <ForceSignOut />;

  return (
    <main className="relative container max-sm:px-2 h-full pt-16 md:pt-20 md:pb-4">
      <section className="relative h-full md:flex max-sm:flex-col max-sm:gap-2">
        <nav className="w-full md:w-1/3 md:h-full md:p-2 rounded-l dark:bg-zinc-900/75">
          <ChatSidebar conversation={conversation} />
        </nav>
        <div className="relative h-full rounded-r dark:bg-zinc-700 max-sm:rounded md:w-2/3">
          {children}
        </div>
      </section>
    </main>
  );
};

export default Layout;
