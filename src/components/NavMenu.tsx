'use client';

import Link from 'next/link';
import { Icons } from './Icons';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/NavigationMenu';

const MangaComponents: {
  title: string;
  href: string;
  description: string;
}[] = [
  {
    title: 'Mới cập nhật',
    href: '/manga/latest',
    description: '',
  },
  {
    title: 'Ngẫu nhiên',
    href: '/manga/random',
    description: 'Hiển thị truyện ngẫu nhiên',
  },
  {
    title: 'Tìm kiếm nâng cao',
    href: '/manga/advancedSearch',
    description: 'Tìm kiếm truyện dựa trên nhiều tiêu chí',
  },
];

const ForumComponents: { title: string; href: string; description: string }[] =
  [
    {
      title: 'Forum',
      href: '/forum',
      description: '',
    },
    {
      title: 'Sự kiện',
      href: '/forum/event',
      description: 'Thread sự kiện của Moetruyen',
    },
    {
      title: 'Thông báo',
      href: '/forum/announcement',
      description: 'Thread thông báo của Moetruyen',
    },
  ];

// TODO: Fix responsive
const NavMenu = () => {
  return (
    <NavigationMenu className="justify-start">
      <NavigationMenuList>
        {/* Manga */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-white bg-transparent">
            Manga
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid md:w-[400px] lg:grid-cols-[1fr_.75fr] gap-2 lg:w-[500px] p-2">
              {MangaComponents.map((c, i) =>
                i === 0 ? (
                  <li key={c.title} className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link href={c.href} className="block relative">
                        <div className="absolute inset-x-0 bottom-0 text-center text-slate-50 bg-zinc-800">
                          {c.title}
                        </div>
                        {/* TODO: Image */}
                        <Icons.logo className="h-full w-full mx-auto bg-black" />
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ) : (
                  <li key={c.title}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={c.href}
                        className="flex flex-col gap-4 p-6 tracking-tight rounded-md h-full text-center hover:text-slate-50 hover:bg-zinc-800 transition-colors"
                      >
                        <div className="font-semibold">{c.title}</div>
                        <p className="text-sm">{c.description}</p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                )
              )}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Forum */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-white bg-transparent">
            Forum
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid md:w-[400px] lg:grid-cols-[1fr_.75fr] gap-2 lg:w-[500px] p-2">
              {ForumComponents.map((c, i) =>
                i === 0 ? (
                  <li key={c.title} className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link href={c.href} className="block relative">
                        <div className="absolute inset-x-0 bottom-0 text-center text-slate-50 bg-zinc-800">
                          {c.title}
                        </div>
                        {/* TODO: Image */}
                        <Icons.logo className="h-full w-full mx-auto bg-black" />
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ) : (
                  <li key={c.title}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={c.href}
                        className="flex flex-col gap-4 p-6 tracking-tight rounded-md h-full text-center hover:text-slate-50 hover:bg-zinc-800 transition-colors"
                      >
                        <div className="font-semibold">{c.title}</div>
                        <p className="text-sm">{c.description}</p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                )
              )}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavMenu;
