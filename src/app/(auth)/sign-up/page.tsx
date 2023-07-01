import SignUp from '@/components/Auth/SignUp';
import { Button } from '@/components/ui/Button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng ký',
  description: 'Đăng nhập Moetruyen',
};

const Page = () => {
  return (
    <div className="container max-sm:px-0 h-full flex items-center">
      <div className="relative w-full h-4/5 dark:bg-zinc-900/50 p-5 flex justify-center items-center rounded-lg">
        <div className="w-full md:w-3/4">
          <Button
            variant="link"
            className="absolute top-4 left-0 md:left-4 flex items-center"
          >
            <ChevronLeft />
            <Link href="/">Trang chủ</Link>
          </Button>
          <SignUp />
        </div>
      </div>
    </div>
  );
};

export default Page;
