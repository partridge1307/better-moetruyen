import { Spoiler, createStyles, getStylesRef } from '@mantine/core';
import type { Prisma } from '@prisma/client';
import dynamic from 'next/dynamic';
import { FC } from 'react';

const MoetruyenEditorOutput = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  { ssr: false }
);

interface CommentProps {
  id: number;
  content: Prisma.JsonValue;
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

const CommentContent: FC<CommentProps> = ({ id, content }): JSX.Element => {
  const { classes } = useStyles();

  return (
    <Spoiler
      maxHeight={288}
      showLabel="Xem thêm"
      hideLabel="Ẩn bớt"
      classNames={classes}
    >
      <MoetruyenEditorOutput id={id} content={content} />
    </Spoiler>
  );
};

export default CommentContent;
