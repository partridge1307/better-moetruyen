import { useEffect, useState, useRef, type RefObject } from 'react';

export default function useOnScreen(ref: RefObject<HTMLElement>) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isOnScreen, setIsOnScreen] = useState(false);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(([entry]) =>
      setIsOnScreen(entry.isIntersecting)
    );
  }, []);

  useEffect(() => {
    if (observerRef.current !== null && ref.current !== null) {
      observerRef.current.observe(ref.current);
    }

    return () => {
      if (observerRef.current !== null) {
        observerRef.current.disconnect();
      }
    };
  }, [ref]);

  return isOnScreen;
}
