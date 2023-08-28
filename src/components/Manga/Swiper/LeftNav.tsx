import { ChevronLeft } from 'lucide-react';
import { FC, memo } from 'react';

interface LeftNavProps {
  disabled: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const LeftNav: FC<LeftNavProps> = ({ disabled, onClick }) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label="Previous Slide"
      className="absolute z-[4] left-0 md:left-auto md:right-0 bottom-0 md:-translate-x-full p-1"
    >
      <ChevronLeft className="w-12 h-12" />
    </button>
  );
};

export default memo(LeftNav);
