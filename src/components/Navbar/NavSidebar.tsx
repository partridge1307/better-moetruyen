'use client';

import { cn } from '@/lib/utils';
import { Book, Menu, Pin, SunMoon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/Sheet';
import { SwitchWithIcon } from '../ui/Switch';
import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import { DialogClose } from '@radix-ui/react-dialog';

interface NavContentProps {
  icon: JSX.Element;
  title: string;
  subMenu: {
    title: string;
    link: string;
  }[];
}

const NavSidebar = () => {
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const [colorTheme, setColorTheme] = useLocalStorage({ key: 'theme' });
  const [isChecked, setChecked] = useState<boolean>(false);

  const NavContent: NavContentProps[] = useMemo(
    () => [
      {
        icon: <Book />,
        title: 'Manga',
        subMenu: [
          {
            title: 'Mới cập nhật',
            link: '/latest',
          },
          {
            title: 'Tìm kiếm nâng cao',
            link: '/advanced-search',
          },
          {
            title: 'Ngẫu nhiên',
            link: '/random',
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
    ],
    []
  );

  useEffect(() => {
    if (colorTheme) {
      if (
        colorTheme === 'dark' ||
        (!('theme' in localStorage) && colorScheme === 'dark')
      ) {
        document.documentElement.classList.add('dark');
        setChecked(true);
      } else {
        document.documentElement.classList.remove('dark');
        setChecked(false);
      }
    }
  }, [colorScheme, colorTheme]);

  function handleSwitch(checked: boolean) {
    if (checked) {
      document.documentElement.classList.add('dark');
      setColorTheme('dark');
      setChecked(true);
    } else {
      document.documentElement.classList.remove('dark');
      setColorTheme('light');
      setChecked(false);
    }
  }

  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="h-8 w-8" />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 dark:bg-zinc-800">
        <div className="scrollbar dark:scrollbar--dark container flex h-[90%] flex-col overflow-y-auto pb-4 max-sm:px-2">
          <h1 className="sticky top-0 bg-white py-4 text-center text-2xl font-semibold dark:bg-zinc-800">
            Moetruyen
          </h1>
          <ul className="mt-2 flex flex-col gap-y-8 px-4">
            <Link
              href="/"
              className={cn(
                'w-full rounded-lg py-2 text-center text-xl font-medium',
                {
                  'bg-slate-200 dark:bg-zinc-900/70': pathname === '/',
                  'hover:bg-slate-100 dark:hover:bg-zinc-700': pathname !== '/',
                }
              )}
            >
              <DialogClose>Trang chủ</DialogClose>
            </Link>

            {NavContent.map((nc) => (
              <li key={nc.title} className="space-y-4">
                <div className="flex items-center gap-2 text-xl">
                  {nc.icon}
                  <p>{nc.title}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {nc.subMenu.map((nsm) => (
                    <Link
                      key={nsm.title}
                      href={nsm.link}
                      className={cn('rounded-lg py-2 pl-8 transition-colors', {
                        'bg-slate-200 dark:bg-zinc-900/70':
                          pathname === nsm.link,
                        'hover:bg-slate-100 dark:hover:bg-zinc-700':
                          pathname !== nsm.link,
                      })}
                    >
                      <DialogClose>{nsm.title}</DialogClose>
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex h-[10%] items-center justify-between px-6 dark:bg-zinc-900">
          <div>
            <p>©Moetruyen</p>
            <p>Version: 8w2</p>
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
