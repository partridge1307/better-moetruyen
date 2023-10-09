import { getAuthSession } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FC } from 'react';

interface pageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const session = await getAuthSession();
  if (session) return redirect('/');

  const isAccessDenied = !!searchParams['error'];

  return (
    <main className="absolute inset-0 flex justify-center items-center">
      <section className="p-5 md:p-10 text-center space-y-20 rounded-md dark:bg-zinc-900/60">
        <h1 className="text-3xl font-semibold text-red-500">
          {isAccessDenied ? 'Từ chối đăng nhập' : 'Có lỗi xảy ra khi đăng nhập'}
        </h1>

        <div className="space-y-3">
          <p>
            {isAccessDenied
              ? 'Yêu cầu đăng nhập bị từ chối. Tài khoản hoặc mật khẩu không chính xác'
              : 'Có lỗi xảy ra khi đăng nhập'}
          </p>
          <p>
            Vui lòng{' '}
            <Link
              href="/sign-in"
              className="text-lg font-semibold hover:underline underline-offset-2"
            >
              Đăng nhập
            </Link>{' '}
            lại
          </p>
        </div>
      </section>
    </main>
  );
};

export default page;
