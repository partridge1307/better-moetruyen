'use client';

import { cn } from '@/lib/utils';
import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import {
  Album,
  BookOpen,
  Home,
  Menu,
  Pin,
  SunMoon,
  Users2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '../ui/Sheet';
import { SwitchWithIcon } from '../ui/Switch';

interface NavContentProps {
  icon: JSX.Element;
  title: string;
  subMenu: {
    title: string;
    link: string;
  }[];
}

const NavSidebar = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const [colorTheme, setColorTheme] = useLocalStorage({ key: 'theme' });
  const [isChecked, setChecked] = useState<boolean>(true);

  const NavContent: NavContentProps[] = useMemo(
    () => [
      ...(isLoggedIn
        ? [
            {
              icon: <Album />,
              title: 'Theo dõi',
              subMenu: [
                {
                  title: 'Team',
                  link: '/follow/team',
                },
                {
                  title: 'Manga',
                  link: '/follow/manga',
                },
                {
                  title: 'Người dùng',
                  link: '/follow/user',
                },
              ],
            },
          ]
        : []),
      {
        icon: <BookOpen />,
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
        icon: <Users2 />,
        title: 'Cộng đồng',
        subMenu: [
          {
            title: 'Forum',
            link: process.env.NEXT_PUBLIC_FORUM_URL!,
          },
        ],
      },
      {
        icon: <Pin />,
        title: 'Thông tin',
        subMenu: [
          {
            title: 'Cộng đồng',
            link: '/social',
          },
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
    [isLoggedIn]
  );

  useEffect(() => {
    if (!colorTheme) return;

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
        <Menu aria-label="sidebar button" className="h-8 w-8" />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-muted">
        <div className="scrollbar dark:scrollbar--dark container flex h-[90%] flex-col overflow-y-auto pb-4 max-sm:px-2">
          <h1 className="sticky top-0 py-4 text-center text-2xl font-semibold bg-muted">
            Moetruyen
          </h1>
          <ul className="mt-2 flex flex-col gap-y-8 px-4">
            <Link href="/">
              <SheetClose
                className={cn(
                  'flex justify-center items-center w-full gap-2 py-2 rounded-lg text-center text-xl font-medium',
                  {
                    'bg-primary-foreground': pathname === '/',
                    'hover:bg-primary-foreground/70': pathname !== '/',
                  }
                )}
              >
                <Home className="h-6 w-6" /> Trang chủ
              </SheetClose>
            </Link>

            {NavContent.map((nc) => (
              <li key={nc.title} className="space-y-4">
                <div className="flex items-center gap-2 text-xl">
                  {nc.icon}
                  <p>{nc.title}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {nc.subMenu.map((nsm) => (
                    <Link key={nsm.title} href={nsm.link}>
                      <SheetClose
                        className={cn(
                          'w-full py-2 pl-8 text-start rounded-lg transition-colors duration-100',
                          {
                            'bg-primary-foreground': pathname === nsm.link,
                            'hover:bg-primary-foreground/70':
                              pathname !== nsm.link,
                          }
                        )}
                      >
                        {nsm.title}
                      </SheetClose>
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex h-[10%] items-center justify-between px-6 bg-primary-foreground">
          <div>
            <p>©Moetruyen</p>
            <p>Version: 1.3.1</p>
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
