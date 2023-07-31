import { cn } from '@/lib/utils';
import { useClickOutside, useDisclosure } from '@mantine/hooks';
import { Menu } from 'lucide-react';
import { FC } from 'react';
import ChatTab from '../Chat/ChatTab';

interface MobileSidebarProps {}

const MobileSidebar: FC<MobileSidebarProps> = ({}) => {
  const [isOpen, handler] = useDisclosure(false);
  const sidebarRef = useClickOutside(() => handler.close());

  return (
    <>
      <nav className="w-full sm:h-20 dark:bg-zinc-900/75 rounded-t">
        <div className="h-14 flex justify-between items-center px-2 pr-4">
          <Menu
            role="button"
            className="w-10 h-10"
            onClick={(e) => {
              e.preventDefault();
              handler.open();
            }}
          />
          <h1 className="font-semibold text-lg">Trò chuyện</h1>
        </div>
      </nav>

      <aside
        ref={sidebarRef}
        className={cn(
          'absolute w-4/5 h-full top-0 left-0 z-20 rounded p-1 dark:bg-zinc-900 border transition-transform',
          isOpen ? 'translate-x-0' : '-translate-x-[999px]'
        )}
      >
        <ChatTab />
      </aside>
    </>
  );
};

export default MobileSidebar;
