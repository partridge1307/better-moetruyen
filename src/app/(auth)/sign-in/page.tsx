import SignIn from '@/components/Auth/SignIn';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const Page = () => {
  return (
    <div className="absolute inset-0">
      <div className="h-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-20">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: 'ghost' }), 'self-start')}
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          <p>Trang chủ</p>
        </Link>

        <SignIn />
      </div>
    </div>
  );
};

export default Page;
