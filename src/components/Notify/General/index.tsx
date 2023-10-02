import { FC } from 'react';
import { ExtendedNotify } from '..';
import { TabsContent } from '@/components/ui/Tabs';
import { formatTimeToNow } from '@/lib/utils';

interface GeneralNotiProps {
  notifies: ExtendedNotify[];
}

const GeneralNoti: FC<GeneralNotiProps> = ({ notifies }) => {
  return (
    <TabsContent
      value="GENERAL"
      className="space-y-2 max-h-72 overflow-auto pr-1.5 scrollbar dark:scrollbar--dark"
    >
      {!!notifies.length ? (
        notifies.map((noti) => (
          <a
            key={noti.id}
            href={noti.endPoint}
            className={`flex items-start gap-3 p-2 rounded-md transition-colors${
              !noti.isRead ? ' dark:bg-zinc-800 hover:dark:bg-zinc-800/80' : ''
            }`}
            onClick={() =>
              fetch('/api/notify', {
                method: 'PATCH',
                body: JSON.stringify({ id: noti.id }),
              })
            }
          >
            <time
              dateTime={new Date(noti.createdAt).toDateString()}
              className="shrink-0 text-sm leading-6"
            >
              {formatTimeToNow(new Date(noti.createdAt))}
            </time>

            <p>{noti.content}</p>
          </a>
        ))
      ) : (
        <p className="p-2">Bạn chưa có thông báo nào</p>
      )}
    </TabsContent>
  );
};

export default GeneralNoti;
