'use client';

import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { Button, buttonVariants } from '../ui/Button';
const UserSignInForm = dynamic(() => import('./UserSignInForm'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-32 rounded-lg animate-pulse dark:bg-zinc-900" />
  ),
});

const SignIn = () => {
  const [signInType, setSignInType] = useState<'MAGIC_LINK' | 'CREDENTIALS'>(
    'MAGIC_LINK'
  );

  return (
    <div className="container mx-auto flex h-full flex-col gap-8">
      <div className="text-center text-2xl font-semibold mt-10">
        <p>Moetruyen</p>
      </div>
      <div className="space-y-8">
        <div className="space-y-4">
          <UserSignInForm signInType={signInType} />
          <Button
            className="w-full"
            onClick={() =>
              setSignInType((prev) =>
                prev === 'CREDENTIALS' ? 'MAGIC_LINK' : 'CREDENTIALS'
              )
            }
          >
            Đăng nhập bằng {signInType === 'CREDENTIALS' ? 'email' : 'mật khẩu'}
          </Button>
        </div>
        <p className="text-center">
          Lần đầu tới Moetruyen?{' '}
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({
                variant: 'link',
                size: 'sm',
              }),
              'text-blue-500'
            )}
          >
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
