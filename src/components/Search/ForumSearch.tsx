'use client';

import type { SubForum } from '@prisma/client';
import { DialogClose } from '@radix-ui/react-dialog';
import Image from 'next/image';
import { FC } from 'react';

interface ForumSearchProps {
  forums?: Pick<SubForum, 'title' | 'banner'>[];
}

const ForumSearch: FC<ForumSearchProps> = ({ forums }) => {
  return !!forums?.length ? (
    <div className="space-y-7">
      {forums.map((forum, idx) => (
        <a
          key={idx}
          target="_blank"
          href={`/m/${forum.title.split(' ').join('-')}`}
        >
          <DialogClose className="grid grid-cols-[.1fr_1fr] w-full gap-4 p-2 rounded-md text-start transition-colors duration-100 hover:dark:bg-zinc-800">
            <div className="relative w-32 pt-[56.25%] rounded-md">
              {!!forum.banner && (
                <Image
                  fill
                  sizes="(max-width: 640px) 20vw, 25vw"
                  quality={40}
                  src={forum.banner}
                  alt={`${forum.title} Thumbnail`}
                  className="object-cover object-top rounded-md"
                />
              )}
            </div>
            <p>{forum.title}</p>
          </DialogClose>
        </a>
      ))}
    </div>
  ) : (
    <p>Không có kết quả</p>
  );
};

export default ForumSearch;
