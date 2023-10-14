'use client';

import '@/styles/mantine/globals.css';
import classes from '@/styles/mantine/post.module.css';
import { ScrollArea } from '@mantine/core';
import '@mantine/core/styles.layer.css';
import type { Post, SubForum } from '@prisma/client';
import { FC } from 'react';

interface LastActivityListProps {
  posts: (Pick<Post, 'id' | 'title'> & {
    subForum: Pick<SubForum, 'title' | 'slug'>;
  })[];
}

const LastActivityList: FC<LastActivityListProps> = ({ posts }) => {
  return (
    <ScrollArea.Autosize
      mah={'18rem'}
      scrollHideDelay={150000}
      type="scroll"
      className="rounded-md dark:bg-zinc-900/60"
      classNames={classes}
    >
      {posts.map((post) => (
        <a
          key={post.id}
          target="_blank"
          href={`${process.env.NEXT_PUBLIC_FORUM_URL}/${post.subForum.slug}/${post.id}`}
        >
          <dl className="p-4 rounded-lg hover:cursor-pointer hover:dark:bg-zinc-900">
            <dt className="font-medium">{post.title}</dt>
            <dd className="text-sm">m/{post.subForum.title}</dd>
          </dl>
        </a>
      ))}
    </ScrollArea.Autosize>
  );
};

export default LastActivityList;
