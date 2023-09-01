import { db } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

interface TabsProps {
  userId: string;
}

const TabInfo: FC<TabsProps> = async ({ userId }) => {
  const mangas = await db.manga.findMany({
    where: { creatorId: userId, isPublished: true },
    select: { id: true, slug: true, name: true, image: true },
  });

  return (
    <Tabs defaultValue="manga">
      <TabsList>
        <TabsTrigger value="manga">Manga</TabsTrigger>
      </TabsList>

      <TabsContent
        value="manga"
        className="p-1 rounded-md space-y-4 dark:bg-zinc-800"
      >
        {mangas.map((manga) => (
          <Link
            key={manga.id}
            href={`/manga/${manga.slug}`}
            className="flex gap-4 p-1 rounded-md transition-colors hover:dark:bg-zinc-900"
          >
            <div className="relative w-48 h-32">
              <Image
                fill
                sizes="50vw"
                src={manga.image}
                alt={`${manga.name} Thumbnail`}
                className="object-cover rounded-md"
              />
            </div>

            <h1 className="text-lg font-semibold">{manga.name}</h1>
          </Link>
        ))}
      </TabsContent>
    </Tabs>
  );
};

export default TabInfo;
