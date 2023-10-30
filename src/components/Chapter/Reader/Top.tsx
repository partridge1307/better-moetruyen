'use client';

import { cn } from '@/lib/utils';
import classes from '@/styles/chapter/top.module.css';
import { ChevronLeft, Menu, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';
import { memo, useContext, useEffect, useRef } from 'react';
import {
  CommentToggleContext,
  InfoToggleContext,
  MenuToggleContext,
} from './Context';

interface TopProps {
  href: string;
  title: string;
}

const Top: FC<TopProps> = ({ href, title }) => {
  const [menuToggle, setMenuToggle] = useContext(MenuToggleContext);
  const [commentToggle, setCommentToggle] = useContext(CommentToggleContext);
  const [showInfo] = useContext(InfoToggleContext);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;

    const isOverflowing =
      titleRef.current.clientWidth < titleRef.current.scrollWidth;

    isOverflowing && titleRef.current.classList.add(classes.mt_top_title_run);
  }, []);

  return (
    <section
      className={`${classes.mt_top_wrapper} ${
        menuToggle || commentToggle ? classes.active : ''
      } ${menuToggle && commentToggle ? classes.active_both : ''}`}
    >
      <div
        className={`${classes.mt_top_inner} ${showInfo ? classes.active : ''}`}
      >
        <Link
          href={href}
          aria-label="manga info link"
          className="shrink-0 flex items-center gap-1 py-1 px-2.5 rounded-full transition-colors hover:bg-muted"
        >
          <ChevronLeft className="max-sm:w-8 max-sm:h-8" />
          <span className="max-sm:hidden">Quay lại</span>
        </Link>

        <h1 ref={titleRef} className={classes.mt_top_title}>
          <span>{title}</span>
        </h1>

        <div className={classes.mt_top_action}>
          <button
            aria-label="comment button"
            type="button"
            className={cn(
              'shrink-0 flex items-center gap-1.5 py-1 px-1.5 md:px-2.5 rounded-full transition-colors',
              {
                'bg-muted': commentToggle,
              }
            )}
            onClick={() => setCommentToggle((prev) => !prev)}
          >
            <MessageSquare />
            <span className="max-sm:hidden">Bình luận</span>
          </button>

          <button
            aria-label="menu button"
            type="button"
            className={cn(
              'shrink-0 flex items-center gap-1.5 py-1 px-1.5 md:px-2.5 rounded-full transition-colors',
              {
                'bg-muted': menuToggle,
              }
            )}
            onClick={() => setMenuToggle((prev) => !prev)}
          >
            <Menu className="max-sm:w-8 max-sm:h-8" />
            <span className="max-sm:hidden">Menu</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default memo(Top);
