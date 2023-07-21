import { AutoLinkNode, LinkNode } from '@lexical/link';
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import type { Prisma } from '@prisma/client';
import { FC, memo } from 'react';
import { theme } from '../Editor/Theme';
import { ImageNode } from '../Editor/nodes/Image';
import { YouTubeNode } from '../Editor/nodes/Youtube';
import { toast } from '@/hooks/use-toast';

interface SubCommentContentProps {
  index: number;
  content: Prisma.JsonValue;
}

function onError(err: Error): void {
  // eslint-disable-next-line no-console
  console.log(err);
  toast({
    title: 'Có lỗi xảy ra',
    description: 'Có lỗi xảy ra khi load Sub Comment',
    variant: 'destructive',
  });
}

const SubCommentContent: FC<SubCommentContentProps> = ({ index, content }) => {
  const initialConfig: InitialConfigType = {
    namespace: `MTSubComment-${index}`,
    onError,
    theme,
    editable: false,
    editorState: JSON.stringify(content),
    nodes: [AutoLinkNode, ImageNode, YouTubeNode, LinkNode],
  };

  return (
    <div className="p-2 px-3 rounded-2xl dark:bg-zinc-700">
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </LexicalComposer>
    </div>
  );
};

export default memo(SubCommentContent);
