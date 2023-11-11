import { useInterval } from '@mantine/hooks';
import { useCallback, useEffect, useRef, useState } from 'react';

const miniumPage = 10;

const useViewCalc = (chapterId: number, totalImages: number) => {
  const [seconds, setSeconds] = useState(0);
  const interval = useInterval(() => setSeconds((s) => s + 1), 1000);
  const threshold = useRef(
    totalImages > miniumPage ? 30 : Math.floor(totalImages * 3 * 0.7)
  );

  useEffect(() => {
    interval.start();

    return () => interval.stop();
  }, [interval]);

  const calcView = useCallback(() => {
    if (seconds >= threshold.current) {
      interval.stop();
      setSeconds(0);

      fetch('/api/chapter', {
        method: 'POST',
        body: JSON.stringify({ id: chapterId }),
      });
    }
  }, [chapterId, interval, seconds]);

  return { calcView };
};

export { useViewCalc };
