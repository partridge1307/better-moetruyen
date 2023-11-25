import { db } from '@/lib/db';
import { formatTimeToNow } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC } from 'react';

interface NormalProps {
  mangaId: number;
}

const Normal: FC<NormalProps> = async ({ mangaId }) => {
  const chapters = await db.manga
    .findUnique({
      where: {
        id: mangaId,
        isPublished: true,
      },
    })
    .chapter({
      select: {
        id: true,
        isPublished: true,
        name: true,
        chapterIndex: true,
        createdAt: true,
        volume: true,
        team: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            comment: true,
          },
        },
      },
    });
  if (!chapters) return notFound();

  let latestChapter = chapters[0];

  return (
    <ul className="space-y-5">
      {chapters
        .sort((a, b) => b.chapterIndex - a.chapterIndex)
        .map((chapter) => {
          if (!chapter.isPublished) return null;

          if (chapter.createdAt.getTime() > latestChapter.createdAt.getTime()) {
            latestChapter = chapter;
          }

          return (
            <li key={chapter.id} className="flex gap-2 md:gap-4">
              <Link
                href={`/chapter/${chapter.id}`}
                className="block flex-1 py-1 px-1.5 rounded-md space-y-1.5 transition-colors bg-muted hover:bg-muted/70"
              >
                <div className="flex items-center gap-1.5 md:text-lg font-semibold">
                  {latestChapter.id === chapter.id && (
                    <span className="py-0.5 px-1 md:px-1.5 mr-1 md:mr-1.5 text-sm rounded-md bg-foreground text-primary-foreground">
                      NEW
                    </span>
                  )}
                  <p className="line-clamp-1">
                    Vol. {chapter.volume} Ch. {chapter.chapterIndex}
                    {!!chapter.name && ` - ${chapter.name}`}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <time dateTime={chapter.createdAt.toDateString()}>
                    {formatTimeToNow(chapter.createdAt)}
                  </time>

                  <span className="flex items-center gap-1">
                    {chapter._count.comment}
                    <MessageSquare className="w-4 h-4" />
                  </span>
                </div>
              </Link>

              {!!chapter.team && (
                <Link
                  href={`/team/${chapter.team.id}`}
                  className="flex items-center gap-3 py-1 px-2 rounded-md transition-colors bg-muted hover:bg-muted/70"
                >
                  <div className="relative w-10 h-10 aspect-square">
                    <Image
                      fill
                      sizes="(max-width: 640px) 10vw, 15vw"
                      quality={40}
                      src={chapter.team.image}
                      alt={`${chapter.team.name} Cover`}
                      className="object-cover rounded-full"
                    />
                  </div>

                  <p className="text-lg font-semibold line-clamp-1 md:max-w-[7rem] lg:max-w-[10rem] max-sm:hidden">
                    {chapter.team.name}
                  </p>
                </Link>
              )}
            </li>
          );
        })}
    </ul>
  );
};

export default Normal;
