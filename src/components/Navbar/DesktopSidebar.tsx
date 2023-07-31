import { FC } from 'react';
import ChatTab from '../Chat/ChatTab';
import { MessageCircle } from 'lucide-react';

interface DesktopSidebarProps {}

const DesktopSidebar: FC<DesktopSidebarProps> = ({}) => {
  return (
    <nav className="relative w-full h-full overflow-clip rounded-l dark:bg-zinc-900/75 p-2 flex flex-col gap-2">
      <h1 className="text-xl font-semibold flex items-center gap-1">
        <MessageCircle className="w-6 h-6" /> Trò chuyện
      </h1>

      <ChatTab />
    </nav>
  );
};

export default DesktopSidebar;
