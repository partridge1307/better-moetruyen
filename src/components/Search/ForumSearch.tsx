'use client';

import type { SubForum } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';
import { SheetClose } from '../ui/Sheet';

interface ForumSearchProps {
  forums?: Pick<SubForum, 'title' | 'slug' | 'banner'>[];
}

const ForumSearch: FC<ForumSearchProps> = ({ forums }) => {
  return !!forums?.length ? (
    <div className="grid md:grid-cols-2 gap-4">
      {forums.map((forum, idx) => (
        <a key={idx} target="_blank" href={`/m/${forum.slug}`}>
          <SheetClose className="w-full text-start grid grid-cols-[.5fr_1fr] lg:grid-cols-[.2fr_1fr] gap-4 p-2 rounded-md transition-colors hover:bg-muted">
            <div>
              {!!forum.banner && (
                <div className="relative aspect-video">
                  <Image
                    fill
                    sizes="(max-width: 640px) 20vw, 25vw"
                    quality={40}
                    src={forum.banner}
                    alt={`${forum.title} Thumbnail`}
                    className="object-cover object-top rounded-md"
                  />
                </div>
              )}
            </div>

            <p className="text-2xl lg:text-3xl font-semibold">{forum.title}</p>
          </SheetClose>
        </a>
      ))}
    </div>
  ) : (
    <p>Không có kết quả</p>
  );
};

export default ForumSearch;
