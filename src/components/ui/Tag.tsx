import { cn } from '@/lib/utils';
import { FC } from 'react';

interface TagWrapperProps extends React.HTMLAttributes<HTMLUListElement> {}

const TagWrapper: FC<TagWrapperProps> = ({ className, children, ...props }) => (
  <ul
    className={cn(
      'flex flex-wrap gap-2 max-w-sm md:max-w-md lg:max-w-lg xl:max-w-[100%]',
      className
    )}
    {...props}
  >
    {children}
  </ul>
);

interface TagContentProps extends React.HTMLAttributes<HTMLLIElement> {}

const TagContent: FC<TagContentProps> = ({ className, children, ...props }) => (
  <li
    className={cn(
      'p-1 md:px-2 text-xs md:text-sm bg-[#2E2EFF] text-white w-fit rounded-full',
      className
    )}
    {...props}
  >
    {children}
  </li>
);

export { TagWrapper, TagContent };
