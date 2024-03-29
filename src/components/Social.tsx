'use client';

import { cn } from '@/lib/utils';
import styles from '@/styles/social.module.css';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { Icons } from './Icons';

interface SocialProps {
  pageLikes: number;
  serverMembers: number;
}

const Social: FC<SocialProps> = ({ pageLikes, serverMembers }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <main
      className={`container max-sm:px-2 space-y-10 lg:space-y-20 pb-10 ${styles.wrapper}`}
    >
      <h1 className="relative text-2xl font-semibold w-fit">
        <Icons.bg
          className={cn(
            'absolute inset-0 -translate-x-[10%] translate-y-1/4 -rotate-3 -z-10 scale-[2] opacity-0 transition-opacity duration-1000 dark:fill-zinc-900',
            {
              'opacity-100': animate,
            }
          )}
        />
        <span>Cộng đồng</span>
      </h1>

      <section
        className={cn(
          '-translate-x-[9999px] -translate-y-[2222px] transition-transforn duration-500',
          {
            'translate-x-0 translate-y-0': animate,
          }
        )}
      >
        <h1 className="text-xl font-semibold rotate-6 w-fit">Facebook</h1>

        <div className="relative aspect-video">
          <div className={styles.leftWrapper} />

          <p className="absolute top-0.5 lg:top-[15%] right-0 rotate-6 font-semibold">
            {pageLikes} lượt thích
          </p>

          <a
            href="https://www.facebook.com/Bfangteam"
            target="_blank"
            className={`absolute inset-x-0 h-[30%] left-0 bottom-0 flex items-center ${styles.colorTransition}`}
            style={{ clipPath: 'polygon(0% 100%, 100% 100%, 0 10%)' }}
          >
            <p className="text-lg lg:text-6xl font-semibold lg:translate-x-1/2 translate-y-1/4 lg:translate-y-1/2 inline-flex items-center gap-2 rotate-6 lg:rotate-3">
              <ArrowLeft className="lg:w-14 lg:h-14" />
              <span>Đến xem</span>
            </p>
          </a>
        </div>
      </section>

      <section
        className={cn(
          '-translate-x-[2222px] translate-y-[9999px] transition-transforn duration-500',
          {
            'translate-x-0 translate-y-0': animate,
          }
        )}
      >
        <h1 className="text-xl font-semibold text-end w-full flex justify-end">
          <span className="-rotate-6">Discord</span>
        </h1>

        <div className="relative aspect-video">
          <div className={styles.rightWrapper} />

          <p className="absolute top-0.5 left-0 lg:top-[15%] font-semibold -rotate-6">
            {serverMembers} thành viên
          </p>

          <a
            href="https://www.facebook.com/Bfangteam"
            target="_blank"
            className={`absolute inset-x-0 h-[30%] left-0 bottom-0 flex justify-end items-center ${styles.colorTransition}`}
            style={{ clipPath: 'polygon(0% 100%, 100% 100%, 100% 10%)' }}
          >
            <p className="text-lg lg:text-6xl font-semibold lg:-translate-x-1/2 translate-y-1/4 lg:translate-y-1/2 inline-flex items-center gap-2 -rotate-6 lg:-rotate-3">
              <span>Đến xem</span>
              <ArrowRight className="lg:w-14 lg:h-14" />
            </p>
          </a>
        </div>
      </section>
    </main>
  );
};

export default Social;
