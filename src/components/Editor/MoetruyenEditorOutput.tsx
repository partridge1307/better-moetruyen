'use client';

import { toast } from '@/hooks/use-toast';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { Prisma } from '@prisma/client';
import { FC, memo, useCallback } from 'react';
import { theme } from '../Editor/Theme';
import { ImageNode } from './nodes/Image';
import { YouTubeNode } from './nodes/Youtube';

function onError(err: Error): void {
  // eslint-disable-next-line no-console
  console.log(err);
  toast({
    title: 'Có lỗi xảy ra',
    description: 'Có lỗi xảy ra khi load Comment',
    variant: 'destructive',
  });
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
    namespace: `MTComment-${id}`,
    onError,
    theme,
    editable: false,
    nodes: [AutoLinkNode, ImageNode, YouTubeNode, LinkNode],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable aria-label="Comment content" />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <EditorContent content={content} />
    </LexicalComposer>
  );
};

export default memo(MoetruyenEditorOutput);

const EditorContent = ({ content }: { content: any }) => {
  const [editor] = useLexicalComposerContext();

  const init = useCallback(() => {
    editor.setEditorState(editor.parseEditorState(content));
  }, [content, editor]);

  setTimeout(() => {
    init();
  }, 0);

  return null;
};
