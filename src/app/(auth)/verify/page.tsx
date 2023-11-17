import VerifyNavigation from '@/components/Auth/VerifyNavigation';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { verifyAuthToken } from '@/lib/jwt';
import { cn } from '@/lib/utils';
import { AuthVerifyResultEnum } from '@/lib/validators/auth';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FC } from 'react';
import { z } from 'zod';

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
  if (!tokenParam) return redirect('/');

  const session = await getAuthSession();
  if (session) return redirect('/');

  const token = tokenParam instanceof Array ? tokenParam[0] : tokenParam;

  let result: z.infer<typeof AuthVerifyResultEnum>,
    sessionTokenStr = '';
  try {
    const { email, password } = await verifyAuthToken(token);

    const createdUser = await db.user.create({
      data: {
        email,
        password,
      },
    });

    const sessionToken = randomUUID();
    const createdSession = await db.session.create({
      data: {
        sessionToken,
        userId: createdUser.id,
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
    });
    sessionTokenStr = createdSession.sessionToken;

    result = AuthVerifyResultEnum.Enum.OK;
  } catch (error) {
    result = AuthVerifyResultEnum.Enum.SERVER_ERROR;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        result = AuthVerifyResultEnum.Enum.DUPLICATED_ERROR;
    }

    if (error === 'JWT ERROR') {
      result = AuthVerifyResultEnum.Enum.EXPIRED;
    }
  }

  return (
    <main className="absolute inset-0 flex justify-center items-center">
      <section className="p-10 space-y-20 rounded-md dark:bg-zinc-900/60">
        <h1
          className={cn('text-center font-semibold text-3xl', {
            'text-red-500': result !== 'OK',
            'text-green-500': result === 'OK',
          })}
        >
          {result === 'OK' ? 'Thành công' : 'Xin lỗi'}
        </h1>

        <div className="text-center space-y-10">
          {result === 'OK' ? (
            <dl className="space-y-2">
              <dt className="text-xl font-medium">
                Bạn đã tạo tài khoản thành công!
              </dt>

              <dd>
                Hãy cùng Mòe tìm hiểu{' '}
                <Link
                  href="/"
                  className="hover:underline underline-offset-2 font-medium text-lg"
                >
                  Moetruyen
                </Link>{' '}
                nhé!
              </dd>
            </dl>
          ) : (
            <dl className="space-y-2">
              <dt className="text-xl font-medium">
                Mòe không thể tạo tài khoản cho bạn!
              </dt>

              <dd>
                <p>
                  {result === 'DUPLICATED_ERROR'
                    ? 'Đã có người khác tạo tài khoản trước đó rồi'
                    : result === 'EXPIRED'
                    ? 'Mail xác thực đã hết hạn mất rồi'
                    : 'Có lỗi xảy ra'}
                </p>

                <p>
                  Vui lòng{' '}
                  <Link
                    href="/sign-up"
                    className="font-medium hover:underline underline-offset-2 text-lg"
                  >
                    đăng ký
                  </Link>{' '}
                  lại nhé
                </p>
              </dd>
            </dl>
          )}

          <VerifyNavigation
            isSuccess={result === 'OK'}
            sessionToken={sessionTokenStr}
          />
        </div>
      </section>
    </main>
  );
};

export default Page;
