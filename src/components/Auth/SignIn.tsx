import Link from 'next/link';
import UserSignInForm from './UserSignInForm';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/Button';

const SignIn = () => {
  return (
    <div className="container mx-auto flex h-full flex-col gap-8">
      <div className="text-center text-2xl font-semibold mt-10">
        <p>Moetruyen</p>
      </div>
      <div className="space-y-8">
        <UserSignInForm />
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
