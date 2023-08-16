'use client';

import Link from 'next/link';
import UserSignUpForm from './UserSignUpForm';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/Button';

const SignUp = () => {
  return (
    <div className="container mx-auto flex h-full flex-col gap-8">
      <div className="text-center text-2xl font-semibold mt-10">
        <p>Moetruyen</p>
      </div>
      <div className="space-y-8">
        <UserSignUpForm />
        <p className="text-center">
          Đã là member Moetruyen?{' '}
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ variant: 'link', size: 'sm' }),
              'text-blue-500'
            )}
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
