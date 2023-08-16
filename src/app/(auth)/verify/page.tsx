import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { AuthVeifyValidator } from '@/lib/validators/auth';
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';
import { ZodError } from 'zod';
import type { Metadata } from 'next';

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
  openGraph: {
    title: 'Xác thực tài khoản',
    description: 'Xác thực tài khoản | Moetruyen',
  },
  twitter: {
    title: 'Đăng ký',
    description: 'Đăng ký | Moetruyen',
  },
};

interface pageProps {
  params: {
    token: string;
  };
  searchParams: {
    token: string | string[] | undefined;
  };
}

const Page: FC<pageProps> = async ({ searchParams }) => {
  const tokenParam = searchParams['token'];
  try {
    let decoded;
    if (Array.isArray(tokenParam)) {
      const firstToken = tokenParam[0];
      decoded = verifyToken(firstToken);
    } else if (typeof tokenParam === 'string') {
      decoded = verifyToken(tokenParam);
    } else throw new Error('Invalid URL');

    const { email, password } = AuthVeifyValidator.parse(decoded);
    await db.user.create({
      data: {
        email,
        password,
      },
    });
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
