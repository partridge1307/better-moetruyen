import { AutoLinkNode, LinkNode } from '@lexical/link';
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { Prisma } from '@prisma/client';
import { FC } from 'react';
import { theme } from '../Editor/Theme';
import { ImageNode } from '../Editor/nodes/Image';
import { YouTubeNode } from '../Editor/nodes/Youtube';

interface SubCommentContentProps {
  index: number;
  content: Prisma.JsonValue;
}

function onError(err: Error): void {
  console.log(err);
}

const SubCommentContent: FC<SubCommentContentProps> = ({ index, content }) => {
  const initialConfig: InitialConfigType = {
    namespace: `MTComment-${index}`,
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

export default SubCommentContent;
