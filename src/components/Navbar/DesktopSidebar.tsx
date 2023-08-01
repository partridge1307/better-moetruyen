import { FC } from 'react';
import ChatTab from '../Chat/ChatTab';

interface DesktopSidebarProps {}

const DesktopSidebar: FC<DesktopSidebarProps> = ({}) => {
  return (
    <>
      <ChatTab />
    </>
  );
};

export default DesktopSidebar;
