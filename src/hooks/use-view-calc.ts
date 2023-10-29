import { useInterval } from '@mantine/hooks';
import { useEffect, useState } from 'react';

const useViewCalc = (currentChapterId: number) => {
  const [seconds, setSeconds] = useState(0);
  const interval = useInterval(() => setSeconds((s) => s + 1), 1000);

  useEffect(() => {
    interval.start();

    return interval.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calcView = () => {
    if (seconds >= 30) {
      fetch('/api/chapter', {
        method: 'POST',
        body: JSON.stringify({ id: currentChapterId }),
      });

      interval.stop();
      setSeconds(0);
    }
    return;
  };

  return { calcView };
};

export { useViewCalc };
