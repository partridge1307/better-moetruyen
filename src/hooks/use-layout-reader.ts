import { useState } from 'react';

export type LayoutType = 'VERTICAL' | 'SINGLE' | 'DOUBLE';

const useLayoutReader = () => {
  const savedLayout =
    (localStorage.getItem('layout') as LayoutType) ?? 'VERTICAL';
  const [layout, set] = useState<LayoutType>(savedLayout);

  const setLayout = (type: LayoutType) => {
    localStorage.setItem('layout', type);

    set(type);
  };

  return { layout, setLayout };
};

export { useLayoutReader };
