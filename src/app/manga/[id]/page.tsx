import ChapterList from '@/components/Chapter/ChapterList';
import MangaImage from '@/components/MangaImage';
import UserAvatar from '@/components/User/UserAvatar';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { db } from '@/lib/db';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { FC, Suspense } from 'react';

interface pageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  if (!!!params.id)
    return {
      title: 'Moetruyen',
      description: 'Powered by Yuri',
    };
  const manga = await db.manga.findFirst({
    where: {
      id: parseInt(params.id, 10),
    },
    select: {
      name: true,
      description: true,
    },
  });
  if (!manga)
    return {
      title: 'Moetruyen',
      description: 'Powered by Yuri',
    };

  return {
    title: `Đọc ${manga.name} - Moetruyen`,
    description: manga.description,
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const manga = await db.manga.findFirst({
    where: {
      id: parseInt(params.id, 10),
      isPublished: true,
    },
    include: {
      author: true,
      tags: true,
      creator: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });
  if (!manga) return notFound();

  return (
    <div className="container mx-auto h-full pt-20 space-y-10">
      <div className="relative w-full h-[22rem] md:h-72">
        <Image
          fill
          src={manga.image}
          alt="Manga Image"
          className="object-cover brightness-[.3] rounded-md"
        />
        <div className="absolute inset-0 flex max-sm:justify-center items-center md:items-end p-4 md:p-6 rounded-md bg-gradient-to-t dark:from-zinc-900 to-transparent">
          <div className="flex max-sm:flex-col max-sm:items-center max-w-[100%] gap-2 md:gap-10">
            <MangaImage
              image={manga.image}
              className="object-cover rounded-md"
            />
            <div className="flex-1 space-y-2 md:space-y-3">
              <p
                className="text-xl md:text-4xl font-bold line-clamp-2 md:line-clamp-3"
                title={manga.name}
              >
                {manga.name}
              </p>
              <p className="max-sm:text-sm max-sm:line-clamp-2">
                {!!manga.author && manga.author.map((a) => a.name).join(', ')}
              </p>
              <ul className="text-sm flex items-center flex-wrap gap-3 max-h-20 md:max-h-32 overflow-auto">
                {!!manga.tags &&
                  manga.tags.map((t) => (
                    <li
                      key={t.id}
                      title={t.description}
                      className="p-1 px-2 bg-slate-200 dark:bg-sky-700 rounded-full"
                    >
                      {t.name}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="dark:bg-zinc-900/80 rounded-md p-6 space-y-6">
        <p>{manga.description}</p>
        <Tabs defaultValue="chapter">
          <TabsList className="dark:bg-zinc-800 space-x-2">
            <TabsTrigger value="chapter">Chapter</TabsTrigger>
            <TabsTrigger value="comment">Bình luận</TabsTrigger>
          </TabsList>
          <TabsContent
            value="chapter"
            className="grid grid-cols-1 md:grid-cols-[.3fr_1fr] gap-4"
          >
            <Card className="h-fit dark:bg-transparent border-none shadow-none">
              <CardHeader>
                {!!manga.creator.image && <UserAvatar user={manga.creator} />}
                <CardTitle>{manga.creator.name}</CardTitle>
              </CardHeader>
            </Card>
            <Suspense fallback={<Loader2 className="h-4 w-4 animate-spin" />}>
              <ChapterList mangaId={params.id} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default page;
