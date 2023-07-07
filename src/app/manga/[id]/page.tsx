import ChapterList from "@/components/Chapter/ChapterList";
import EditorOutput from '@/components/EditorOutput';
import MangaImage from '@/components/MangaImage';
import UserAvatar from '@/components/User/UserAvatar';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { TagContent, TagWrapper } from '@/components/ui/Tag';
import { db } from '@/lib/db';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { FC, Suspense } from 'react';

interface pageProps {
  params: {
    id: string;
  };
}

type discordProps = {
  code: boolean;
  id?: string;
  name?: string;
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  if (!params.id)
    return {
      title: 'Moetruyen',
      description: 'Powered by Yuri',
    };
  const manga = await db.manga.findFirst({
    where: {
      id: +params.id,
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
    description: `Đọc ${manga.name} tại Moetruyen`,
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const manga = await db.manga.findFirst({
    where: {
      id: +params.id,
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

  let discord: discordProps = { code: false };
  if (manga.discordLink) {
    try {
      const data = await (
        await fetch(
          `https://discord.com/api/v10/invites/${manga.discordLink
            .split('/')
            .pop()}?with_counts=true`,
          {
            next: { revalidate: 300 },
          }
        )
      ).json();

      if (data.code === 10006) discord.code = false;
      discord.code = true;
      discord.id = data.guild.id;
      discord.name = data.guild.name;
    } catch (error) {
      discord.code = false;
    }
  }

  return (
    <>
      <div className="container mx-auto h-full pt-20 space-y-14">
        <div className="relative h-max">
          <div className="p-4 max-sm:space-y-4 md:flex md:gap-10">
            <MangaImage className="h-48 w-full md:w-40" image={manga.image} />

            <div className="space-y-1 md:space-y-2">
              <p className="text-2xl md:text-4xl font-semibold">{manga.name}</p>
              <p className="text-sm">
                {manga.author.map((a) => a.name).join(', ')}
              </p>
            </div>
          </div>

          <div className="absolute inset-0 -z-10">
            <div className="relative h-full w-full">
              <Image
                fill
                priority
                sizes="0%"
                src={manga.image}
                alt="Manga Background Image"
                className="object-cover blur-sm brightness-[.2] md:brightness-[.3] rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="p-3 md:p-6 space-y-10 dark:bg-zinc-900/80 rounded-md">
          <div className="space-y-1">
            <p className="font-semibold text-lg">Thể loại</p>
            <TagWrapper>
              {manga.tags.map((tag, idx) => (
                <TagContent
                  key={idx}
                  title={`${tag.description ? tag.description : tag.name}`}
                >
                  {tag.name}
                </TagContent>
              ))}
            </TagWrapper>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-lg">Mô tả</p>
            <EditorOutput content={manga.description} />
          </div>

          <Tabs defaultValue="chapter">
            <TabsList className="space-x-2 dark:bg-zinc-800">
              <TabsTrigger value="chapter">Chapter</TabsTrigger>
              <TabsTrigger value="comment">Bình luận</TabsTrigger>
            </TabsList>
            <TabsContent
              value="chapter"
              className="grid grid-cols-1 md:grid-cols-[.4fr_1fr] lg:grid-cols-[.3fr_1fr] gap-6"
            >
              <div className="space-y-4">
                <Card className="bg-transparent/10">
                  <CardHeader>
                    {!!manga.creator.image && (
                      <UserAvatar user={manga.creator} />
                    )}
                    <CardTitle>{manga.creator.name}</CardTitle>
                  </CardHeader>
                </Card>

                {discord.code && (
                  <div className="p-1">
                    <p className="text-lg px-1 w-full">
                      Discord:{' '}
                      <span className="font-semibold">{discord.name}</span>
                    </p>
                    <iframe
                      height={300}
                      src={`https://discord.com/widget?id=${discord.id}&theme=dark`}
                      allowFullScreen
                      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                      className="w-full border dark:border-zinc-700 rounded-md"
                    />
                  </div>
                )}

                {manga.facebookLink && (
                  <div className="p-1">
                    <p className="text-lg px-1">Facebook</p>
                    <div className="relative w-full">
                      <div
                        className="fb-page"
                        data-href={manga.facebookLink}
                        data-tabs="timeline"
                        data-height="300"
                        data-small-header="false"
                        data-adapt-container-width="true"
                        data-hide-cover="false"
                        data-show-facepile="true"
                      >
                        <blockquote
                          cite={manga.facebookLink}
                          className="fb-xfbml-parse-ignore"
                        >
                          <a href={manga.facebookLink}>
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </a>
                        </blockquote>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}>
                <ChapterList mangaId={manga.id} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Script
        strategy="lazyOnload"
        async
        defer
        crossOrigin="anonymous"
        src="https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v17.0"
      />
    </>
  );
};

export default page;
