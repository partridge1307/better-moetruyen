import { useCallback, useRef, useState } from 'react';

export type LayoutType = 'VERTICAL' | 'SINGLE' | 'DOUBLE';

const useLayoutReader = () => {
  const savedLayout = useRef(
    (localStorage.getItem('layout') as LayoutType) ?? 'VERTICAL'
  );
  const [layout, set] = useState<LayoutType>(savedLayout.current);

  const setLayout = useCallback((type: LayoutType) => {
    localStorage.setItem('layout', type);

    set(type);
  }, []);

  return { layout, setLayout };
};

export { useLayoutReader };
