import { useState } from 'react';

export type DirectionType = 'ltr' | 'rtl';

const useDirectionReader = () => {
  const savedLayout =
    (localStorage.getItem('direction') as DirectionType) ?? 'ltr';
  const [direction, set] = useState<DirectionType>(savedLayout);

  const setDirection = (type: DirectionType) => {
    localStorage.setItem('direction', type);

    set(type);
  };

  return { direction, setDirection };
};

export { useDirectionReader };
