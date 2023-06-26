import Link from 'next/link';
import { Icons } from './Icons';
import NavMenu from './NavMenu';
import { getAuthSession } from '@/lib/auth';
import { buttonVariants } from './ui/Button';
import UserAccountNav from '@/components/User/UserAccountNav';

const Navbar = async () => {
  const session = await getAuthSession();

  return (
    <div className="fixed inset-x-0 h-fit py-2 top-0 z-10 border-b border-zinc-700">
      <div className="container h-full max-w-7xl flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="hidden md:flex items-center gap-2">
          <Icons.logo className="h-8 w-8 sm:h-6 sm:w-6 bg-white" />
          <p className="font-bold text-xl">Moetruyen</p>
        </Link>

        {/* Navigation menu */}
        <NavMenu />

        {/* Search */}

        {/* Profile */}
        {session?.user ? (
          <UserAccountNav user={session.user} />
        ) : (
          <Link
            href="/sign-in"
            className={buttonVariants({
              variant: 'ghost',
              className: 'bg-black text-center',
            })}
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
