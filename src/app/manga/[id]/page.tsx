import ChapterList from "@/components/Chapter/ChapterList";
import MangaImage from "@/components/MangaImage";
import UserAvatar from "@/components/User/UserAvatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { db } from "@/lib/db";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FC, Suspense } from "react";

interface pageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  if (!!!params.id)
    return {
      title: "Moetruyen",
      description: "Powered by Yuri",
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
      title: "Moetruyen",
      description: "Powered by Yuri",
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
    <div className="container mx-auto h-full space-y-10 pt-20">
      <div className="relative h-72 w-full">
        <Image
          fill
          priority
          src={manga.image}
          alt="Manga Image"
          className="rounded-md object-cover brightness-[.3]"
        />
        <div className="absolute inset-0 flex items-end rounded-md bg-gradient-to-t to-transparent p-6 dark:from-zinc-900">
          <div className="flex max-w-[100%] gap-2 max-sm:flex-col max-sm:items-center md:gap-10">
            <MangaImage
              image={manga.image}
              className="rounded-md object-cover"
            />
            <div className="flex-1 space-y-2 md:space-y-3">
              <p
                className="line-clamp-2 text-xl font-bold md:line-clamp-3 md:text-4xl"
                title={manga.name}
              >
                {manga.name}
              </p>
              <p className="max-sm:line-clamp-2 max-sm:text-sm">
                {!!manga.author && manga.author.map((a) => a.name).join(", ")}
              </p>
              <ul className="flex max-h-20 flex-wrap items-center gap-3 overflow-auto text-sm md:max-h-32">
                {!!manga.tags &&
                  manga.tags.map((t) => (
                    <li
                      key={t.id}
                      title={t.description}
                      className="rounded-full bg-slate-200 p-1 px-2 dark:bg-sky-700"
                    >
                      {t.name}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 rounded-md p-6 dark:bg-zinc-900/80">
        {/* TODO: FIX editor */}
        {/* <p>{manga.description}</p> */}
        <Tabs defaultValue="chapter">
          <TabsList className="space-x-2 dark:bg-zinc-800">
            <TabsTrigger value="chapter">Chapter</TabsTrigger>
            <TabsTrigger value="comment">Bình luận</TabsTrigger>
          </TabsList>
          <TabsContent
            value="chapter"
            className="grid grid-cols-[.3fr_1fr] gap-4"
          >
            <Card className="h-fit border-none shadow-none dark:bg-transparent">
              <CardHeader>
                {!!manga.creator.image && <UserAvatar user={manga.creator} />}
                <CardTitle>{manga.creator.name}</CardTitle>
              </CardHeader>
            </Card>
            <Suspense fallback={<Loader2 className="h-4 w-4 animate-spin" />}>
              <ChapterList mangaId={manga.id} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default page;
