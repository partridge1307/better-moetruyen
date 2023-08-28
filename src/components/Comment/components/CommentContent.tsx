import { cn } from '@/lib/utils';
import type { Prisma } from '@prisma/client';
import { ChevronsDown, ChevronsUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { FC, useEffect, useRef, useState } from 'react';

const MoetruyenEditorOutput = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  { ssr: false }
);

interface CommentProps {
  id: number;
  content: Prisma.JsonValue;
}

const CommentContent: FC<CommentProps> = ({ id, content }): JSX.Element => {
  const cmtRef = useRef<HTMLDivElement>(null);
  const [cmtHeight, setCmtHeight] = useState(0);
  const [isCollapsed, setisCollapsed] = useState<boolean>(true);

  useEffect(() => {
    if (cmtRef.current) {
      setTimeout(() => {
        !!cmtRef.current && setCmtHeight(cmtRef.current.clientHeight);
      }, 100);
    }
  }, [cmtRef]);

  return (
    <div
      ref={cmtRef}
      aria-label="Comment content"
      className={cn(
        'relative p-2 px-3 max-h-80 overflow-clip rounded-2xl dark:bg-zinc-700',
        !isCollapsed && 'max-h-fit pb-10'
      )}
    >
      <MoetruyenEditorOutput id={id} content={content} />

      {cmtHeight >= 320 ? (
        <div
          role="button"
          onClick={() => setisCollapsed((prev) => !prev)}
          className="absolute bottom-0 inset-x-0 flex justify-center items-end h-10 bg-gradient-to-t dark:from-zinc-900 cursor-pointer transition-colors hover:dark:from-zinc-800"
        >
          {isCollapsed ? (
            <p className="flex items-center justify-center gap-1">
              <span>
                <ChevronsDown className="w-4 h-4" />
              </span>
              Xem thêm
              <span>
                <ChevronsDown className="w-4 h-4" />
              </span>
            </p>
          ) : (
            <p className="flex items-center justify-center gap-1">
              <span>
                <ChevronsUp className="w-4 h-4" />
              </span>
              Thu gọn
              <span>
                <ChevronsUp className="w-4 h-4" />
              </span>
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default CommentContent;
