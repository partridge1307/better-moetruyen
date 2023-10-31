import { useCallback, useRef, useState } from 'react';

export type DirectionType = 'ltr' | 'rtl';

const useDirectionReader = () => {
  const savedLayout = useRef(
    (localStorage.getItem('direction') as DirectionType) ?? 'ltr'
  );
  const [direction, set] = useState<DirectionType>(savedLayout.current);

  const setDirection = useCallback((type: DirectionType) => {
    localStorage.setItem('direction', type);

    set(type);
  }, []);

  return { direction, setDirection };
};

export { useDirectionReader };
