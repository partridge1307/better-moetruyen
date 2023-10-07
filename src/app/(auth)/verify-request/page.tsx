import { getAuthSession } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const page = async () => {
  const session = await getAuthSession();
  if (session) return redirect('/');

  return (
    <main className="absolute inset-0 flex justify-center items-center">
      <section className="p-5 md:p-10 text-center space-y-20 rounded-md dark:bg-zinc-900/60">
        <h1 className="text-3xl font-semibold">
          Một đường dẫn đã được gửi tới Mail của bạn
        </h1>

        <p>
          Vui lòng kiểm tra. Nếu không nhận được vui lòng{' '}
          <Link
            href="/sign-in"
            className="text-lg font-semibold underline-offset-2 hover:underline"
          >
            Đăng nhập
          </Link>{' '}
          lại
        </p>
      </section>
    </main>
  );
};

export default page;
