import { useInterval } from '@mantine/hooks';
import { useCallback, useEffect, useState } from 'react';

const useViewCalc = (currentChapterId: number) => {
  const [seconds, setSeconds] = useState(0);
  const interval = useInterval(() => setSeconds((s) => s + 1), 1000);

  useEffect(() => {
    interval.start();

    return () => interval.stop();
  }, [interval]);

  const calcView = useCallback(() => {
    if (seconds >= 30) {
      interval.stop();
      fetch('/api/chapter', {
        method: 'POST',
        body: JSON.stringify({ id: currentChapterId }),
      });
      setSeconds(0);
    }
  }, [currentChapterId, interval, seconds]);

  return { calcView };
};

export { useViewCalc };
