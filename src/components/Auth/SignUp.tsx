'use client';

import Link from 'next/link';
import UserSignUpForm from './UserSignUpForm';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/Button';
import { useSearchParams } from 'next/navigation';

interface SignUpProps extends React.HTMLAttributes<HTMLDivElement> {
  bypassRouteInterception?: boolean;
}

const SignUp = ({
  bypassRouteInterception = false,
  className,
  ...props
}: SignUpProps) => {
  const searchParams = useSearchParams();

  return (
    <div className={cn('container flex flex-col gap-8', className)} {...props}>
      <h1 className="text-center text-2xl font-semibold">Moetruyen</h1>

      <div className="space-y-6">
        <UserSignUpForm />

        <p className="text-center">
          Đã là member Moetruyen?{' '}
          {bypassRouteInterception ? (
            <a
              href="/sign-in"
              className={cn(
                buttonVariants({ variant: 'link', size: 'sm' }),
                'text-blue-500'
              )}
            >
              Đăng nhập
            </a>
          ) : (
            <Link
              href={`/sign-in?visited=${
                parseInt(searchParams.get('visited') ?? '1') + 1
              }`}
              className={cn(
                buttonVariants({ variant: 'link', size: 'sm' }),
                'text-blue-500'
              )}
            >
              Đăng nhập
            </Link>
          )}
        </p>
      </div>
    </div>
  );
};

export default SignUp;
