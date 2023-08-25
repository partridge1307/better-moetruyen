import GeneralFeed from '@/components/Forum/GeneralFeed';
import SubscribedFeed from '@/components/Forum/SubscribedFeed';
import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { Home } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';

interface pageProps {}

const page: FC<pageProps> = async ({}) => {
  const [subForums, session] = await Promise.all([
    db.subForum.findMany({
      orderBy: {
        subscriptions: {
          _count: 'desc',
        },
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
      take: 5,
    }),
    getAuthSession(),
  ]);

  return (
    <section className="container max-sm:px-2 pt-20">
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_.45fr] gap-6">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Bài viết</h1>
          {session ? <SubscribedFeed session={session} /> : <GeneralFeed />}
        </div>

        <div className="max-sm:order-first h-fit rounded-md dark:bg-zinc-900">
          <h1 className="text-lg font-semibold flex items-center gap-1 p-3 rounded-t-md dark:bg-zinc-700">
            <Home className="w-5 h-5" /> Trang chủ
          </h1>

          <div className="space-y-8 p-2 py-4">
            <Link href="/m/create" className={cn(buttonVariants(), 'w-full')}>
              <span className="font-medium">Tạo cộng đồng</span>
            </Link>

            <div className="text-start space-y-4">
              <h1>Cộng đồng nổi bật</h1>
              <ul className="space-y-2">
                {subForums.map((subForum) => (
                  <li key={subForum.id}>
                    <Link href={`/m/${subForum.title.split(' ').join('-')}`}>
                      <div className="p-2 rounded-md hover:dark:bg-zinc-800">
                        <p>
                          m/<span>{subForum.title}</span>
                        </p>
                        <p className="text-sm">
                          {subForum._count.subscriptions} member
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default page;
