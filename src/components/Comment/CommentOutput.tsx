'use client';

import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { formatTimeToNow } from '@/lib/utils';
import { useIntersection } from '@mantine/hooks';
import type { Comment, CommentVote, Prisma, User } from '@prisma/client';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { FC, useEffect, useRef } from 'react';
import UserAvatar from '../User/UserAvatar';
import CommentContent from './CommentContent';
import CommentOEmbed from './CommentOEmbed';
import SubComment from './SubComment';
const CommentFunc = dynamic(() => import('./CommentFunc'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6" />,
});

type ExtendedComment = Pick<
  Comment,
  'id' | 'content' | 'oEmbed' | 'authorId' | 'createdAt'
> & {
  author: Pick<User, 'name' | 'image' | 'color'>;
  votes: CommentVote[];
  _count: { replies: number };
};

interface CommentOutputProps {
  initialComments: ExtendedComment[];
  id: string;
}

const CommentOutput: FC<CommentOutputProps> = ({ initialComments, id }) => {
  const lastCmtRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    threshold: 1,
    root: lastCmtRef.current,
  });
  const { data: session } = useSession();

  const {
    data: CommentData,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ['comment-infinite-query'],
    async ({ pageParam = 1 }) => {
      const query = `/api/manga/${id}/comment/?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}`;

      const { data } = await axios.get(query);
      return data as ExtendedComment[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: { pages: [initialComments], pageParams: [1] },
    }
  );

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const comments =
    CommentData?.pages.flatMap((page) => page) ?? initialComments;

  return (
    <ul className="mt-20 space-y-10">
      {comments.length &&
        comments.map((comment, idx) => {
          const voteAmt = comment.votes.reduce((acc, vote) => {
            if (vote.type === 'UP_VOTE') return acc + 1;
            if (vote.type === 'DOWN_VOTE') return acc - 1;
            return acc;
          }, 0);

          const currentVote = comment.votes.find(
            (vote) => vote.userId === session?.user.id
          )?.type;

          if (idx === comments.length - 1) {
            return (
              <li key={idx} ref={ref} className="flex gap-3 md:gap-6">
                <UserAvatar className="mt-2 w-12 h-12" user={comment.author} />

                <div className="space-y-1">
                  <div className="flex items-end gap-2">
                    <p
                      className="text-lg"
                      style={{
                        color: comment.author.color ? comment.author.color : '',
                      }}
                    >
                      {comment.author.name}
                    </p>
                    <p className="text-sm">
                      {formatTimeToNow(new Date(comment.createdAt))}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <CommentContent index={idx} content={comment.content} />

                    <CommentOEmbed
                      oEmbed={
                        comment.oEmbed as
                          | (Prisma.JsonValue & {
                              link: string;
                              meta: {
                                title?: string;
                                description?: string;
                                image: {
                                  url?: string;
                                };
                              };
                            })
                          | null
                      }
                    />

                    <CommentFunc
                      session={session}
                      authorId={comment.authorId}
                      mangaId={id}
                      commentId={comment.id}
                      currentVote={currentVote}
                      voteAmt={voteAmt}
                    />
                  </div>

                  {comment._count.replies !== 0 ? (
                    <SubComment
                      subCommentLength={comment._count.replies}
                      commentId={comment.id}
                    />
                  ) : null}
                </div>
              </li>
            );
          } else {
            return (
              <li key={idx} className="flex gap-3 md:gap-6">
                <UserAvatar className="mt-2 w-12 h-12" user={comment.author} />

                <div className="space-y-1">
                  <div className="flex items-end gap-2">
                    <p
                      className="text-lg"
                      style={{
                        color: comment.author.color ? comment.author.color : '',
                      }}
                    >
                      {comment.author.name}
                    </p>
                    <p className="text-sm">
                      {formatTimeToNow(new Date(comment.createdAt))}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <CommentContent index={idx} content={comment.content} />

                    <CommentOEmbed
                      oEmbed={
                        comment.oEmbed as
                          | (Prisma.JsonValue & {
                              link: string;
                              meta: {
                                title?: string;
                                description?: string;
                                image: {
                                  url?: string;
                                };
                              };
                            })
                          | null
                      }
                    />

                    <CommentFunc
                      session={session}
                      authorId={comment.authorId}
                      mangaId={id}
                      commentId={comment.id}
                      currentVote={currentVote}
                      voteAmt={voteAmt}
                    />
                  </div>

                  {comment._count.replies !== 0 ? (
                    <SubComment
                      subCommentLength={comment._count.replies}
                      commentId={comment.id}
                    />
                  ) : null}
                </div>
              </li>
            );
          }
        })}

      {isFetchingNextPage && (
        <li className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </li>
      )}
    </ul>
  );
};

export default CommentOutput;
