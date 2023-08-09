import { cn } from '@/lib/utils';
import { Armchair, Crown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface FirstThreeProps {
  mangas: {
    id: number;
    name: string;
    image: string;
  }[];
}

const FirstThree: FC<FirstThreeProps> = ({ mangas }) => {
  return (
    <div className="flex justify-center items-end overflow-auto py-4 dark:bg-zinc-900 rounded-lg">
      {mangas.map((manga, idx) => {
        if (idx === 0 && manga.id !== -1) {
          return (
            <Link
              key={idx}
              href={`/manga/${manga.id}`}
              className={cn('flex flex-col items-center gap-2', 'mx-6 lg:mx-8')}
            >
              <div className="relative w-16 h-16 lg:w-20 lg:h-20">
                <Image
                  width={75}
                  height={75}
                  quality={50}
                  src={manga.image}
                  alt="First Three Top Manga Image"
                  className="absolute top-0 left-0 rounded-full object-cover w-16 h-16 lg:w-20 lg:h-20"
                />
                <Crown className="float-right translate-x-1 -translate-y-2 w-6 h-6 rotate-45 text-orange-400" />
              </div>
              <h6 className="lg:text-lg font-medium text-orange-400">
                Hạng <span>{idx + 1}</span>
              </h6>
            </Link>
          );
        } else {
          if (manga.id === -1) {
            return (
              <div
                key={idx}
                className={cn('flex flex-col items-center gap-2', {
                  'order-first': idx === 1,
                  'order-last': idx === 2,
                })}
              >
                <div className="w-10 h-10 lg:w-14 lg:h-14 flex justify-center items-center dark:bg-zinc-700 rounded-full">
                  <Armchair className="w-8 h-8 opacity-50" />
                </div>
                <h6>
                  Hạng <span>{idx + 1}</span>
                </h6>
              </div>
            );
          } else {
            return (
              <Link
                key={idx}
                href={`/manga/${manga.id}`}
                className={cn('flex flex-col items-center gap-2', {
                  'order-first': idx === 1,
                  'order-last': idx === 2,
                })}
              >
                <Image
                  width={50}
                  height={50}
                  quality={40}
                  src={manga.image}
                  alt="Top Daily Manga Image"
                  className="rounded-full object-cover w-10 h-10 lg:w-14 lg:h-14"
                />
                <h6 className="text-sm">
                  Hạng <span>{idx + 1}</span>
                </h6>
              </Link>
            );
          }
        }
      })}
    </div>
  );
};

export default FirstThree;
