import EditorOutput from '@/components/EditorOutput';
import ForceSignOut from '@/components/ForceSignOut';
import MangaImage from '@/components/MangaImage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { dailyViewGroupByHour, weeklyViewGroupByDay } from '@/lib/query';
import { cn } from '@/lib/utils';
import format from 'date-fns/format';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import WeeklyViewManga from './WeeklyViewManga';
const DailyViewManga = dynamic(() => import('./DailyViewManga'), {
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
  if (!session) return <ForceSignOut />;

  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
  });
  if (!user) return <ForceSignOut />;

  const manga = await db.manga.findFirst({
    where: {
      id: +params.id,
      creatorId: user.id,
    },
    include: {
      chapter: true,
      view: true,
    },
  });
  if (!manga) return notFound();

  const dailyView = await dailyViewGroupByHour(manga.id);
  const weeklyView = await weeklyViewGroupByDay(manga.id);

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
        <MangaImage className="h-48 w-40" image={manga.image} />

        <div className="space-y-6">
          <dl className="flex gap-1">
            <dt>Tên truyện:</dt>
            <dd className="font-semibold">{manga.name}</dd>
          </dl>

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
            <dt>Chapter:</dt>
            <dl>
              <Link
                href={`/me/manga/${manga.id}/chapter`}
                className="text-sky-500"
              >
                Bấm vào đây
              </Link>
            </dl>
          </dl>

          <dl className="space-y-1">
            <dt>Mô tả:</dt>
            <dd className="dark:bg-zinc-600/60 p-2 rounded-md">
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
          <DailyViewManga dailyView={dailyView} />
          <WeeklyViewManga weeklyView={weeklyView} />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default page;
