import { FC } from 'react';
import { TabsContent } from '../ui/Tabs';
import { ExtendedNotify } from '.';
import Link from 'next/link';
import { cn, formatTimeToNow } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface GeneralProps {
  general?: ExtendedNotify[];
}

const General: FC<GeneralProps> = ({ general }) => {
  const { mutate: update } = useMutation({
    mutationFn: async (id: number) => {
      await axios.patch(`/api/notify/${id}`);
    },
  });

  return (
    <TabsContent value="general">
      {general?.length ? (
        <ul className="max-h-72 overflow-auto lg:scrollbar lg:dark:scrollbar--dark">
          {general.map((noti, idx) => (
            <li key={idx}>
              <Link
                // @ts-ignore
                href={`/manga/${noti.content.mangaId}`}
                onClick={() => update(noti.id)}
              >
                <dl
                  className={cn(
                    'text-sm p-2 py-3 rounded inline-flex flex-col max-w-xs sm:max-w-sm md:max-w-md lg:max-w-[500px]',
                    !noti.isRead && 'dark:bg-zinc-900'
                  )}
                >
                  <dt>
                    <span className="font-medium text-white truncate">
                      {noti.fromUser.name}
                    </span>{' '}
                    {noti.type === 'LIKE'
                      ? 'đã thích bình luận của bạn.'
                      : noti.type === 'COMMENT'
                      ? 'đã trả lời bình luận của bạn.'
                      : noti.type === 'MENTION'
                      ? 'đã đề cập đến bạn.'
                      : null}
                  </dt>
                  <dd className="self-end text-xs">
                    {formatTimeToNow(new Date(noti.createdAt))}
                  </dd>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center">Không có thông báo</p>
      )}
    </TabsContent>
  );
};

export default General;
