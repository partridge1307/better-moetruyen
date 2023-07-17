import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { LexicalEditor } from 'lexical';
import { FC } from 'react';

interface componentProps {
  content: LexicalEditor;
}

const NestComponent: FC<componentProps> = ({ content }) => {
  return (
    <LexicalNestedComposer initialEditor={content}>
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        ErrorBoundary={LexicalErrorBoundary}
        placeholder={null}
      />
    </LexicalNestedComposer>
  );
};

export default NestComponent;
