'use client';

import { UpdateView } from '@/components/Chapter/Reader/ViewAction';
import { useInterval } from '@mantine/hooks';
import { useCallback, useEffect, useRef, useState } from 'react';

const miniumPage = 10;

const useViewCalc = (chapterId: number, totalImages: number) => {
  const [seconds, setSeconds] = useState(0);
  const interval = useInterval(() => setSeconds((s) => s + 1), 1000);
  const threshold = useRef(
    totalImages > miniumPage ? 25 : Math.floor(totalImages * 0.7 * 3)
  );

  useEffect(() => {
    interval.start();

    return () => interval.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calcView = useCallback(() => {
    if (seconds < threshold.current) return;

    interval.stop();
    UpdateView(
      chapterId,
      new Date(
        new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
      ).getTime()
    );
  }, [chapterId, interval, seconds]);

  return { calcView };
};

export { useViewCalc };
