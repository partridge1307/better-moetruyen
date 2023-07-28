import { FC } from 'react';
import { TabsContent } from '../ui/Tabs';
import { ExtendedNotify } from './Notifications';

interface GeneralProps {
  general?: ExtendedNotify[];
}

const General: FC<GeneralProps> = ({ general }) => {
  return (
    <TabsContent value="general">
      {general?.length ? (
        <ul className="max-h-72 overflow-auto">
          {general.map((noti, idx) => {
            if (noti.type === 'LIKE') {
              return (
                <li key={idx} className="p-1 py-2 text-sm dark:bg-zinc-900">
                  <p>
                    <span className="font-semibold dark:text-white">
                      {noti.fromUser.name}
                    </span>{' '}
                    vừa thả tim cho bạn.
                  </p>
                </li>
              );
            } else if (noti.type === 'COMMENT') {
              return (
                <li key={idx} className="p-1 py-2 text-sm dark:bg-zinc-900">
                  <p>
                    <span className="font-semibold dark:text-white">
                      {noti.fromUser.name}
                    </span>{' '}
                    vừa phản hồi comment của bạn.
                  </p>
                </li>
              );
            }
          })}
        </ul>
      ) : (
        <p className="text-center">Không có thông báo</p>
      )}
    </TabsContent>
  );
};

export default General;
