'use client';

import Output from 'editorjs-react-renderer';
import { ChevronsDown, ChevronsUp } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';
import CustomImage from './Renderer/CustomImage';
import CustomLink from './Renderer/CustomLink';
import { cn } from '@/lib/utils';

interface EditorOutputProps {
  content: any;
}

const renderers = {
  linktool: CustomLink,
  image: CustomImage,
};

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  useEffect(() => {
    if (ref.current?.clientHeight && ref.current.clientHeight === 80) {
      setShowMore(true);
    }
  }, [ref.current?.clientHeight]);

  return (
    <div
      ref={ref}
      className={cn(
        'relative max-h-20 overflow-clip dark:bg-zinc-700 p-2 rounded-md',
        !isCollapsed && 'max-h-fit pb-10'
      )}
    >
      <Output data={content} renderers={renderers} />
      {showMore ? (
        <div
          role="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t dark:from-zinc-900 rounded-md flex items-center justify-center"
        >
          {isCollapsed ? (
            <>
              <ChevronsDown className="w-4 h-4" />
              Xem thêm
              <ChevronsDown className="w-4 h-4" />
            </>
          ) : (
            <>
              <ChevronsUp className="w-4 h-4" />
              Thu gọn
              <ChevronsUp className="w-4 h-4" />
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default EditorOutput;
