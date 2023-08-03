import EditorOutput from '@/components/EditorOutput';
import ForceSignOut from '@/components/ForceSignOut';
import MangaImage from '@/components/Manga/MangaImage';
import { buttonVariants } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { dailyViewGroupByHour, weeklyViewGroupByDay } from '@/lib/query';
import { cn, filterView } from '@/lib/utils';
import { format, getHours, getDay } from 'date-fns';
import { ArrowUpRightFromCircle, Edit, Loader2, Newspaper } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
const DailyViewManga = dynamic(() => import('./DailyViewManga'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});
const WeeklyViewManga = dynamic(() => import('./WeeklyViewManga'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});

interface pageProps {
  params: {
    id: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
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

  const manga = await db.manga.findFirst({
    where: {
      id: +params.id,
      creatorId: user.id,
    },
    select: {
      _count: {
        select: { chapter: true },
      },
      view: true,
      id: true,
      isPublished: true,
      name: true,
      image: true,
      discordLink: true,
      facebookLink: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!manga) return notFound();

  const dailyView = await dailyViewGroupByHour(manga.id);
  const weeklyView = await weeklyViewGroupByDay(manga.id);

  const filteredDailyView = filterView({
    target: dailyView.map((dv) => ({
      time: getHours(dv.viewTimeCreatedAt[0]),
      view: dv.view,
    })),
    timeRange: [0, 1, 3, 6, 12, 22],
    currentTime: new Date(Date.now()).getHours(),
  });
  const filteredWeeklyView = filterView({
    target: weeklyView.map((wv) => ({
      time: getDay(wv.viewTimeCreatedAt[0]),
      view: wv.view,
    })),
    timeRange: [0, 1, 3, 5, 7],
    currentTime: new Date(Date.now()).getDay(),
  });

  return (
    <Tabs defaultValue="info">
      <TabsList className="grid grid-cols-2 gap-2 dark:bg-zinc-800">
        <TabsTrigger value="info">Thông tin</TabsTrigger>
        <TabsTrigger value="analytics">Thống kê</TabsTrigger>
      </TabsList>

      <TabsContent
        value="info"
        className="flex flex-col max-sm:items-center md:p-2 gap-4"
      >
        <MangaImage className="h-48 w-40" manga={manga} />

        <div className="space-y-6">
          <dl className="flex gap-1">
            <dt>Tên truyện:</dt>
            <dd className="font-semibold">{manga.name}</dd>
          </dl>

          <div className="max-sm:space-y-6 md:flex md:gap-12">
            <dl className="flex gap-1">
              <dt>Trạng thái:</dt>
              <dd
                className={cn(
                  'font-semibold',
                  manga.isPublished ? 'text-green-400' : 'text-red-500'
                )}
              >
                {manga.isPublished ? 'Đã Publish' : 'Chờ Publish'}
              </dd>
            </dl>

            <dl className="flex gap-1">
              <dt>Số lượng chapter:</dt>
              <dl>{manga._count.chapter}</dl>
            </dl>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              href={`/me/manga/${manga.id}/edit`}
              className={cn(
                buttonVariants(),
                'w-full flex gap-2 max-sm:col-span-2'
              )}
            >
              Chỉnh sửa
              <Edit className="w-4 h-4" />
            </Link>
            <Link
              href={`/me/manga/${manga.id}/chapter`}
              className={cn(buttonVariants(), 'w-full flex gap-2')}
            >
              Chapter
              <Newspaper className="w-4 h-4" />
            </Link>
            <Link
              href={`/manga/${manga.id}`}
              className={cn(buttonVariants(), 'w-full flex items-center gap-1')}
            >
              Đến xem truyện
              <ArrowUpRightFromCircle className="h-4 w-4" />
            </Link>
          </div>

          <dl className="space-y-1">
            <dt>Mô tả:</dt>
            <dd className="dark:bg-zinc-600/60 rounded-md">
              <EditorOutput content={manga.description} />
            </dd>
          </dl>

          <div className="max-sm:space-y-2 md:flex md:items-center md:gap-12">
            {manga.facebookLink && (
              <dl className="flex gap-1">
                <dt>Facebook:</dt>
                <dd>
                  <Link href={manga.facebookLink} className="text-sky-500">
                    LINK
                  </Link>
                </dd>
              </dl>
            )}

            {manga.discordLink && (
              <dl className="flex gap-1">
                <dt>Discord:</dt>
                <dd>
                  <Link href={manga.discordLink} className="text-sky-500">
                    LINK
                  </Link>
                </dd>
              </dl>
            )}
          </div>

          <div className="max-sm:space-y-2 md:flex md:items-center md:gap-12">
            <dl className="flex gap-1">
              <dt>Thời gian tạo:</dt>
              <dd>{format(manga.createdAt, 'k:m d/M/y')}</dd>
            </dl>

            <dl className="flex gap-1">
              <dt>Cập nhật lúc:</dt>
              <dd>{format(manga.updatedAt, 'k:m d/M/y')}</dd>
            </dl>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="analytics">
        <div className="p-2 md:px-4 space-y-8 md:space-y-10">
          <DailyViewManga filteredView={filteredDailyView} />
          <WeeklyViewManga filteredView={filteredWeeklyView} />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default page;
