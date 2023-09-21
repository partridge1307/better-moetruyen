'use client';

import { ScrollArea, createStyles, getStylesRef } from '@mantine/core';
import type { Post, SubForum } from '@prisma/client';
import { FC } from 'react';

interface LastActivityListProps {
  posts: (Pick<Post, 'id' | 'title'> & {
    subForum: Pick<SubForum, 'title' | 'slug'>;
  })[];
}

const useStyles = createStyles(() => ({
  thumb: {
    ref: getStylesRef('thumb'),
    'html.dark &': {
      background: '#FFFFFF',
      borderRadius: '50vh',
      border: '2px solid #FFFFFF',
    },
    '&:hover': {
      background: '#2E2E2E',
    },
  },
  scrollbar: {
    ref: getStylesRef('scrollbar'),
    borderRadius: '50vh',
    'html.dark &': {
      background: '#000000',
    },
  },
}));

const LastActivityList: FC<LastActivityListProps> = ({ posts }) => {
  const { classes } = useStyles();

  return (
    <ScrollArea
      mah={'18rem'}
      scrollHideDelay={1000}
      type="scroll"
      className="rounded-md dark:bg-zinc-900/60"
      classNames={classes}
    >
      {posts.map((post) => (
        <a
          key={post.id}
          target="_blank"
          href={`/m/${post.subForum.slug}/${post.id}`}
        >
          <dl className="p-4 rounded-lg hover:cursor-pointer hover:dark:bg-zinc-900">
            <dt className="font-medium">{post.title}</dt>
            <dd className="text-sm">m/{post.subForum.title}</dd>
          </dl>
        </a>
      ))}
    </ScrollArea>
  );
};

export default LastActivityList;
