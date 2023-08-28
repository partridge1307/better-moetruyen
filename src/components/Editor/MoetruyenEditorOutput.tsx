'use client';

import '@/styles/mteditor.css';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import {
  LexicalComposer,
  type InitialConfigType,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import type { Prisma } from '@prisma/client';
import { FC } from 'react';
import { theme } from '../Editor/Theme';
import { ImageNode } from './nodes/Image';
import { YouTubeNode } from './nodes/Youtube';
import { SteamNode } from './nodes/Steam';

function onError(err: Error): void {
  // eslint-disable-next-line no-console
  console.log(err);
}

interface MoetruyenEditorOutputProps {
  id: number;
  content: Prisma.JsonValue;
}

const MoetruyenEditorOutput: FC<MoetruyenEditorOutputProps> = ({
  id,
  content,
}) => {
  const initialConfig: InitialConfigType = {
    namespace: `MTEditorOutput-${id}`,
    onError,
    theme,
    editable: false,
    editorState: JSON.stringify(content),
    nodes: [AutoLinkNode, ImageNode, SteamNode, YouTubeNode, LinkNode],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable aria-label="Comment content" />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
    </LexicalComposer>
  );
};

export default MoetruyenEditorOutput;
