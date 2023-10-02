'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { Button, buttonVariants } from '../ui/Button';
import { useSearchParams } from 'next/navigation';
import UserSignInForm from './UserSignInForm';

interface SignInProps extends React.HTMLAttributes<HTMLDivElement> {
  bypassRouteInterception?: boolean;
}

const SignIn = ({
  bypassRouteInterception = false,
  className,
  ...props
}: SignInProps) => {
  const searchParams = useSearchParams();
  const [signInType, setSignInType] = useState<'MAGIC_LINK' | 'CREDENTIALS'>(
    'MAGIC_LINK'
  );

  return (
    <div className={cn('container flex flex-col gap-8', className)} {...props}>
      <h1 className="text-center text-2xl font-semibold">Moetruyen</h1>

      <div className="space-y-6">
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
          {bypassRouteInterception ? (
            <a
              href="/sign-up"
              className={cn(
                buttonVariants({
                  variant: 'link',
                  size: 'sm',
                }),
                'dark:text-blue-400'
              )}
            >
              Đăng ký
            </a>
          ) : (
            <Link
              href={`/sign-up?visited=${
                parseInt(searchParams.get('visited') ?? '1') + 1
              }`}
              className={cn(
                buttonVariants({
                  variant: 'link',
                  size: 'sm',
                }),
                'dark:text-blue-400'
              )}
            >
              Đăng ký
            </Link>
          )}
        </p>
      </div>
    </div>
  );
};

export default SignIn;
