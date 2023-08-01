import { cn } from '@/lib/utils';
import { useClickOutside, useDisclosure } from '@mantine/hooks';
import { ChevronRight } from 'lucide-react';
import { FC } from 'react';
import ChatTab from '../Chat/ChatTab';

interface MobileSidebarProps {}

const MobileSidebar: FC<MobileSidebarProps> = ({}) => {
  const [isOpen, handler] = useDisclosure(false);
  const sidebarRef = useClickOutside(() => handler.close());

  return (
    <>
      <div className="absolute top-1 left-0 z-10 p-1 rounded-lg dark:bg-zinc-900">
        <ChevronRight
          role="button"
          className="w-8 h-8"
          onClick={(e) => {
            e.preventDefault();
            handler.open();
          }}
        />
      </div>

      <aside
        ref={sidebarRef}
        className={cn(
          'absolute w-4/5 h-full top-0 left-0 z-10 rounded p-2 dark:bg-zinc-900 border transition-transform',
          isOpen ? 'translate-x-0' : '-translate-x-[999px]'
        )}
      >
        <ChatTab />
      </aside>
    </>
  );
};

export default MobileSidebar;
