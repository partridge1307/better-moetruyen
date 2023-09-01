'use client';

import dynamic from 'next/dynamic';
import { FC } from 'react';
import { Spoiler, createStyles, getStylesRef } from '@mantine/core';
import type { Manga } from '@prisma/client';

const MTEditorOutput = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  { ssr: false }
);

interface MangaDescProps {
  manga: Pick<Manga, 'id' | 'description'>;
}

const useStyles = createStyles(() => ({
  control: {
    ref: getStylesRef('control'),
    '&': {
      width: '100%',
    },
    '&:hover': {
      textDecoration: 'none',
    },
    'html.dark &': {
      color: '#FB923C',
    },
  },
}));

const MangaDesc: FC<MangaDescProps> = ({ manga }) => {
  const { classes } = useStyles();

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
