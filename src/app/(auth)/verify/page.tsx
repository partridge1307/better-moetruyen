import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { AuthVeifyValidator } from '@/lib/validators/auth';
import { Prisma } from '@prisma/client';
import type { Metadata } from 'next';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FC } from 'react';

export const metadata: Metadata = {
  title: 'Xác thực tài khoản',
  description: 'Xác thực Moetruyen',
  keywords: [
    'Xác thực tài khoản',
    'Xác thực',
    'Tài khoản',
    'Manga',
    'Moetruyen',
  ],
};

interface pageProps {
  searchParams: {
    token: string | string[] | undefined;
  };
}

const Page: FC<pageProps> = async ({ searchParams }) => {
  const tokenParam = searchParams['token'];
  try {
    const session = await getAuthSession();
    if (session) return redirect('/');

    let decoded;
    if (Array.isArray(tokenParam)) {
      const firstToken = tokenParam[0];
      decoded = verifyToken(firstToken);
    } else if (typeof tokenParam === 'string') {
      decoded = verifyToken(tokenParam);
    } else throw new Error('Invalid URL');

    const { email, password } = AuthVeifyValidator.parse(decoded);

    await Promise.all([
      db.user.create({
        data: {
          email,
          password,
        },
      }),
      signIn('credentials', { email, password, redirect: false }),
    ]);

    setTimeout(() => {
      return redirect('/');
    }, 15 * 1000);

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-fit max-w-2xl space-y-4">
          <h1 className="text-center text-4xl font-bold tracking-tight text-green-400">
            Chúc mừng
          </h1>
          <p className="text-center">
            Bạn đã tạo tài khoản{' '}
            <Link href="/" className="underline underline-offset-4">
              Moetruyen
            </Link>{' '}
            thành công
            <br />
            Cùng khám phá{' '}
            <Link href="/" className="underline underline-offset-4">
              Moetruyen
            </Link>{' '}
            ngay thôi nhé
          </p>
          <p className="text-sm">
            <span className="text-red-500">*</span>Tự động chuyển về trang chủ
            sau 15s
          </p>
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof Error) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-fit max-w-2xl space-y-4">
            <h1 className="text-center text-4xl font-bold tracking-tight text-red-500">
              Xin lỗi
            </h1>
            <p className="text-center">
              Đường dẫn không hợp lệ
              <br />
              Hãy thử{' '}
              <Link href="/sign-up" className="underline underline-offset-2">
                đăng ký
              </Link>{' '}
              lại nhé
            </p>
          </div>
        </div>
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-fit max-w-2xl space-y-4">
            <h1 className="text-center text-4xl font-bold tracking-tight text-red-500">
              Xin lỗi
            </h1>
            <p className="text-center">
              Có vẻ như tài khoản bị người khác tạo mất mất rồi
              <br />
              Hãy thử{' '}
              <Link href="/sign-up" className="underline underline-offset-2">
                đăng ký
              </Link>{' '}
              tài khoản lại nhé
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-fit max-w-2xl space-y-4">
          <h1 className="text-center text-4xl font-bold tracking-tight text-red-500">
            Xin lỗi
          </h1>
          <p className="text-center">
            Có vẻ như token không hợp lệ mất rồi
            <br />
            Hãy thử{' '}
            <Link href="/sign-up" className="underline underline-offset-2">
              đăng ký
            </Link>{' '}
            tài khoản lại nhé
          </p>
        </div>
      </div>
    );
  }
};

export default Page;
