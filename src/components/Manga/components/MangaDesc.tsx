'use client';

import '@/styles/mantine/globals.css';
import classes from '@/styles/mantine/manga-description.module.css';
import { Spoiler } from '@mantine/core';
import type { Manga } from '@prisma/client';
import dynamic from 'next/dynamic';
import { FC } from 'react';

const MTEditorOutput = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  { ssr: false }
);

interface MangaDescProps {
  manga: Pick<Manga, 'id' | 'description'>;
}

const MangaDesc: FC<MangaDescProps> = ({ manga }) => {
  return (
    <Spoiler
      maxHeight={288}
      showLabel="Xem thêm"
      hideLabel="Ẩn bớt"
      classNames={classes}
    >
      <MTEditorOutput id={manga.id} content={manga.description} />
    </Spoiler>
  );
};

export default MangaDesc;
