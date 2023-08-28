import SignIn from '@/components/Auth/SignIn';
import CloseModal from '@/components/CloseModal';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập Moetruyen',
  keywords: ['sign in', 'Moetruyen'],
};

const Page = () => {
  return (
    <main className="fixed inset-0 z-50 flex items-center bg-white/30 dark:bg-zinc-900/30">
      <section className="container relative mx-auto h-fit p-4 max-w-sm md:max-w-md lg:max-w-lg rounded-lg bg-white dark:bg-zinc-800">
        <CloseModal
          className={cn(
            buttonVariants({ variant: 'link' }),
            'absolute left-4 rounded-md bg-transparent hover:bg-transparent'
          )}
        />
        <SignIn />
      </section>
    </main>
  );
};

export default Page;
