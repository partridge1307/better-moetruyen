import { cn } from '@/lib/utils';
import { Book, Menu, Pin, SunMoon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [isChecked, setChecked] = useState<boolean>(true);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (
        localStorage.theme === 'dark' ||
        (!('theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        setChecked(false);
      }
    }
  }, []);

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
          <ul className="mt-2 flex flex-col gap-y-10 px-4">
            <Link
              href="/"
              className={cn(
                'w-full rounded-lg py-2 text-center text-xl font-medium',
                pathname === '/' && 'bg-slate-200 dark:bg-zinc-700'
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
                      className="rounded-lg py-2 pl-8 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-700"
                    >
                      {nsm.title}
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
