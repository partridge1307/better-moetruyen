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
      className="absolute right-0 z-[4] bottom-0 p-1"
    >
      <ChevronRight className="w-10 h-10" />
    </button>
  );
};

export default memo(RightNav);
