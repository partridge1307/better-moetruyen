'use client';

import DescriptionSkeleton from '@/components/Skeleton/DescriptionSkeleton';
import classes from '@/styles/mantine/manga-info.module.css';
import { Spoiler } from '@mantine/core';
import '@mantine/core/styles.layer.css';
import { useMediaQuery } from '@mantine/hooks';
import type { Manga, MangaAuthor } from '@prisma/client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FC } from 'react';

const MoetruyenEditorOutput = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  {
    ssr: false,
    loading: () => <DescriptionSkeleton />,
  }
);

interface MangaDescriptionProps {
  manga: Pick<Manga, 'id' | 'altName' | 'description'> & {
    author: Pick<MangaAuthor, 'name'>[];
  };
}

const MangaDescription: FC<MangaDescriptionProps> = ({ manga }) => {
  const isMobile = useMediaQuery('(max-width: 640px)');

  return (
    <>
      <Spoiler
        maxHeight={isMobile ? 120 : 300}
        showLabel={
          <p className="w-fit text-sm rounded-b-md px-2.5 py-0.5 bg-primary text-primary-foreground">
            Xem thêm
          </p>
        }
        hideLabel={
          <p className="w-fit text-sm rounded-b-md px-2.5 py-0.5 bg-primary text-primary-foreground">
            Lược bớt
          </p>
        }
        classNames={classes}
      >
        <MoetruyenEditorOutput id={manga.id} content={manga.description} />
        {!!isMobile && (
          <>
            <div className="space-y-1">
              <p className="text-lg font-semibold">Tác giả</p>
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
                {manga.author.map((author, idx) => (
                  <li key={idx}>
                    <Link
                      href={`/advanced-search?author=${author.name}`}
                      className="block py-0.5 px-2 rounded-md bg-foreground/10"
                    >
                      {author.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1">
              <p className="text-lg font-semibold">Tên khác</p>
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
                {manga.altName.map((altName, idx) => (
                  <li
                    key={idx}
                    className="py-0.5 px-2 rounded-md bg-foreground/10"
                  >
                    {altName}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </Spoiler>
      {!isMobile && (
        <>
          <div className="space-y-1 mt-4">
            <p className="text-lg font-semibold">Tác giả</p>
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
              {manga.author.map((author, idx) => (
                <li key={idx}>
                  <Link
                    href={`/advanced-search?author=${author.name}`}
                    className="block py-0.5 px-2 rounded-md bg-foreground/10"
                  >
                    {author.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-1 mt-4">
            <p className="text-lg font-semibold">Tên khác</p>
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
              {manga.altName.map((altName, idx) => (
                <li
                  key={idx}
                  className="py-0.5 px-2 rounded-md bg-foreground/10"
                >
                  {altName}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
};

export default MangaDescription;
