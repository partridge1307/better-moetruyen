import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { AuthVeifyValidator } from '@/lib/validators/auth';
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';
import { z } from 'zod';
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
}

const Page: FC<pageProps> = async ({ params }) => {
  const { token } = params;
  try {
    const decoded = verifyToken(token);
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
    if (error instanceof z.ZodError) {
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-fit max-w-2xl space-y-4">
              <h1 className="text-center text-4xl font-bold tracking-tight text-red-500">
                Xin lỗi
              </h1>
              <p className="text-center">
                Bạn tạo tài khoản này rồi
                <br />
                Hãy quay về{' '}
                <Link href="/" className="underline underline-offset-2">
                  Moetruyen
                </Link>{' '}
                nhé
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
            Có vẻ như có người khác tạo tài khoản này rồi
            <br />
            Hãy thử{' '}
            <Link href="/sign-up" className="underline underline-offset-2">
              đăng ký
            </Link>{' '}
            tài khoản khác nhé
          </p>
        </div>
      </div>
    );
  }
};

export default Page;
