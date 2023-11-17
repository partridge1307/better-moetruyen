'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FC, useEffect, useMemo, useState } from 'react';
import { UpdateCookie } from './UpdateCookie';

interface VerifyNavigationProps {
  isSuccess: boolean;
  second?: number;
  sessionToken?: string;
}

const getSeconds = (countDown: number) => {
  return Math.floor((countDown % (1000 * 60)) / 1000);
};

const VerifyNavigation: FC<VerifyNavigationProps> = ({
  isSuccess,
  second = 15,
  sessionToken,
}) => {
  const router = useRouter();
  const pathName = usePathname();

  const countDate = useMemo(() => {
    const date = new Date();
    date.setSeconds(date.getSeconds() + second);

    return date;
  }, [second]);

  const [countDown, setCountDown] = useState(
    countDate.getTime() - new Date().getTime()
  );
  const [isDone, setDone] = useState(false);
  const [isRouteChange, setRouteChange] = useState(false);

  useEffect(() => {
    if (!sessionToken) return;
    UpdateCookie(sessionToken);
  }, [sessionToken]);

  useEffect(() => {
    const interval = setInterval(
      () => setCountDown(countDate.getTime() + 1000 - new Date().getTime()),
      1000
    );

    return () => clearInterval(interval);
  }, [countDate]);

  useEffect(() => {
    const seconds = getSeconds(countDown);

    if (seconds === 0) {
      setDone(true);

      isSuccess ? router.push('/sign-in') : router.push('/sign-up');
    }
  }, [countDown, isSuccess, router]);

  useEffect(() => {
    if (isDone) {
      setTimeout(() => {
        if (pathName === '/verify') {
          setRouteChange(true);
        }
      }, 5000);
    }
  }, [isDone, pathName]);

  return !isDone ? (
    <p>
      Tự động chuyển về trang{' '}
      {isSuccess ? (
        <Link
          href="/sign-in"
          className="hover:underline underline-offset-2 text-lg font-semibold"
        >
          Đăng nhập
        </Link>
      ) : (
        <Link
          href="/sign-up"
          className="hover:underline underline-offset-2 text-lg font-semibold"
        >
          Đăng ký
        </Link>
      )}{' '}
      sau {getSeconds(countDown)} giây.
    </p>
  ) : isRouteChange ? (
    <p>
      Nếu bạn chưa được chuyển hướng vui lòng bấm vào{' '}
      <Link
        href={isSuccess ? '/sign-in' : '/sign-up'}
        className={`text-lg font-semibold hover:underline underline-offset-2 ${
          isSuccess ? 'text-green-500' : 'text-red-500'
        }`}
      >
        Đây
      </Link>
    </p>
  ) : (
    <p>Đang chuyển hướng...</p>
  );
};

export default VerifyNavigation;
