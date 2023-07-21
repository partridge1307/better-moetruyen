import { cn } from '@/lib/utils';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { Prisma } from '@prisma/client';
import { ChevronsDown, ChevronsUp } from 'lucide-react';
import { FC, useRef, useState } from 'react';
import { theme } from '../Editor/Theme';
import { ImageNode } from '../Editor/nodes/Image';
import { YouTubeNode } from '../Editor/nodes/Youtube';
import { toast } from '@/hooks/use-toast';

interface CommentProps {
  index: number;
  content: Prisma.JsonValue;
}

function onError(err: Error): void {
  // eslint-disable-next-line no-console
  console.log(err);
  toast({
    title: 'Có lỗi xảy ra',
    description: 'Có lỗi xảy ra khi load Comment',
    variant: 'destructive',
  });
}

const CommentContent: FC<CommentProps> = ({ index, content }): JSX.Element => {
  const cmtRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setisCollapsed] = useState<boolean>(true);
  const initialConfig: InitialConfigType = {
    namespace: `MTComment-${index}`,
    onError,
    theme,
    editable: false,
    editorState: JSON.stringify(content),
    nodes: [AutoLinkNode, ImageNode, YouTubeNode, LinkNode],
  };

  return (
    <div
      ref={cmtRef}
      className={cn(
        'relative p-2 px-3 max-h-80 overflow-clip rounded-2xl dark:bg-zinc-700',
        !isCollapsed && 'max-h-fit'
      )}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </LexicalComposer>

      {cmtRef.current && cmtRef.current.clientHeight >= 320 ? (
        <div
          role="button"
          onClick={() => setisCollapsed((prev) => !prev)}
          className="absolute bottom-0 inset-x-0 flex justify-center items-end h-10 bg-gradient-to-t dark:from-zinc-900 to-transparent cursor-pointer transition-colors hover:dark:from-zinc-800"
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
