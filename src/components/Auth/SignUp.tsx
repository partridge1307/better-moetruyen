import Link from 'next/link';
import UserSignUpForm from './UserSignUpForm';

const SignUp = () => {
  return (
    <div className="container mx-auto h-full flex flex-col gap-24">
      <div className="text-center text-2xl font-semibold">
        <p>Moetruyen</p>
      </div>
      <div className="space-y-4">
        <UserSignUpForm />
        <p className="text-center">
          Đã là member Moetruyen?{' '}
          <Link href="/sign-in" className="underline underline-offset-4">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
