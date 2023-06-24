import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { AuthVeifyValidator } from '@/lib/validators/auth';
import Link from 'next/link';
import { FC } from 'react';
import { z } from 'zod';
import 'server-only';

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
        <div className="max-w-2xl h-fit space-y-4">
          <h1 className="text-green-400 text-4xl font-bold tracking-tight text-center">
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
          <div className="max-w-2xl h-fit space-y-4">
            <h1 className="text-red-500 text-4xl font-bold tracking-tight text-center">
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
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="max-w-2xl h-fit space-y-4">
          <h1 className="text-red-500 text-4xl font-bold tracking-tight text-center">
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
