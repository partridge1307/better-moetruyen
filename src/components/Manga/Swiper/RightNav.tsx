import { ChevronRight } from 'lucide-react';
import { FC, memo } from 'react';

interface LeftNavProps {
  disabled: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const RightNav: FC<LeftNavProps> = ({ disabled, onClick }) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label="Next Slide"
      className="absolute right-0 z-[4] top-1/2 -translate-y-1/2 md:p-1 md:hover:bg-zinc-900 md:rounded-full transition-all"
    >
      <ChevronRight className="w-10 h-10 transition-all" />
    </button>
  );
};

export default memo(RightNav);
