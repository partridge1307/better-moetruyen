'use client';

import { cn } from '@/lib/utils';
import { Book, Menu, Pin, SunMoon, User2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from './ui/Button';
import { Sheet, SheetContent, SheetTrigger } from './ui/Sheet';
import { SwitchWithIcon } from './ui/Switch';

interface NavContentProps {
  icon: JSX.Element;
  title: string;
  subMenu: {
    title: string;
    link: string;
  }[];
}

const NavContent: NavContentProps[] = [
  {
    icon: <Book />,
    title: 'Manga',
    subMenu: [
      {
        title: 'Mới cập nhật',
        link: '/manga/latest',
      },
      {
        title: 'Tìm kiếm nâng cao',
        link: '/magna/advanced-search',
      },
      {
        title: 'Ngẫu nhiên',
        link: '/manga/random',
      },
    ],
  },
  {
    icon: <User2 />,
    title: 'Forum',
    subMenu: [
      {
        title: 'Mới cập nhật',
        link: '/manga/latest',
      },
      {
        title: 'Tìm kiếm nâng cao',
        link: '/magna/advanced-search',
      },
      {
        title: 'Ngẫu nhiên',
        link: '/manga/random',
      },
    ],
  },
  {
    icon: <Pin />,
    title: 'Thông tin',
    subMenu: [
      {
        title: 'Luật của web',
        link: '/rule',
      },
      {
        title: 'Về Moetruyen',
        link: '/about',
      },
      {
        title: 'Chính sách điều khoản',
        link: '/tos',
      },
    ],
  },
];

const NavSidebar = () => {
  function handleSwitch(checked: boolean) {
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setChecked(true);
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setChecked(false);
    }
  }

  const pathname = usePathname();
  const [isChecked, setChecked] = useState<boolean>(
    typeof window !== 'undefined' && localStorage.theme === 'dark'
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="p-2 h-fit rounded-full bg-transparent hover:bg-transparent/20 text-black dark:text-white">
          <Menu className="h-8 w-8" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="dark:bg-zinc-800 p-0">
        <div className="container max-sm:px-2 flex flex-col h-[90%] pb-4 overflow-y-auto scrollbar dark:scrollbar--dark">
          <h1 className="font-semibold text-2xl text-center py-4 sticky top-0 bg-white dark:bg-zinc-800">
            Moetruyen
          </h1>
          <ul className="px-4 mt-2 flex flex-col gap-y-10">
            <Link
              href="/"
              className={cn(
                'w-full text-center text-xl font-medium py-2 rounded-lg',
                pathname === '/' ? 'dark:bg-zinc-700 bg-slate-200' : null
              )}
            >
              Trang chủ
            </Link>

            {NavContent.map((nc) => (
              <li key={nc.title}>
                <div className="flex items-center gap-2 text-xl">
                  {nc.icon}
                  <p>{nc.title}</p>
                </div>
                <div className="flex flex-col">
                  {nc.subMenu.map((nsm) => (
                    <Link
                      key={nsm.title}
                      href={nsm.link}
                      className="pl-8 py-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-zinc-700"
                    >
                      {nsm.title}
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="h-[10%] px-6 flex justify-between items-center dark:bg-zinc-900">
          <div>
            <p>©Moetruyen</p>
            <p>Version: 0.0.3</p>
          </div>
          <SwitchWithIcon checked={isChecked} onCheckedChange={handleSwitch}>
            <SunMoon />
          </SwitchWithIcon>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NavSidebar;
