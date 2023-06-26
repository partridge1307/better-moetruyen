import Link from 'next/link';
import { Icons } from '@/components/Icons';
import UserAuthSignUpForm from './UserAuthSignUpForm';

const SignUp = () => {
  return (
    <div className="container mx-auto w-full justify-center flex flex-col sm:w-[400px]">
      <div className="flex flex-col space-y-4 text-center">
        <div className="flex justify-center items-center">
          <Icons.logo className="h-6 w-6 mr-4 bg-white" />
          <h1 className="font-bold text-xl">Moetruyen</h1>
        </div>
        <p className="leading-tight">
          Bạn sẽ chấp nhận mọi điều khoản, chính sách của Moetruyen khi đăng ký
        </p>

        {/* Sign In Form */}
        <UserAuthSignUpForm />

        <p className="px-8 text-sm">
          Đã là thành viên Moetruyen?{' '}
          <Link
            href="/sign-in"
            className="text-sm underline underline-offset-4 hover:text-slate-200"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
