/* eslint-disable no-unused-vars */
'use client';

import { toast } from '@/hooks/use-toast';
import '@/styles/mteditor.css';
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { memo } from 'react';
import { nodes } from './Node';
import { theme } from './Theme';
import AutoEmbedPlugin from './plugins/AutoEmbed';
import AutoLink from './plugins/AutoLink';
import ImagesPlugin from './plugins/Image';
import { MaxLengthPlugin } from './plugins/MaxLength';
import Submit from './plugins/Submit';
import Toolbar from './plugins/Toolbar';
import YouTubePlugin from './plugins/Youtube';

function onError(error: Error): void {
  toast({
    title: 'Có lỗi xảy ra',
    description: 'Có lỗi xảy ra với Text Editor',
    variant: 'destructive',
  });

  // eslint-disable-next-line no-console
  console.log(error);
}

const editorConfig: InitialConfigType = {
  namespace: 'MoetruyenEditor',
  theme,
  onError,
  nodes: [...nodes],
};

const Editor = ({
  id,
  commentId,
  chapterId,
}: {
  id: string;
  commentId?: number;
  chapterId?: number;
}): JSX.Element => {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="moetruyen-editor-wrapper space-y-3">
        <div>
          <Toolbar />
          <div className="moetruyen-editor-inner">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="moetruyen-editor-input rounded-lg focus:ring-1 focus-visible:ring-offset-1" />
              }
              placeholder={
                <div className="moetruyen-placeholder">
                  Nói lên cảm nghĩ của bạn...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          <div className="text-right">
            <CharacterLimitPlugin charset="UTF-16" maxLength={1024} />
          </div>
        </div>
        <Submit id={id} commentId={commentId} chapterId={chapterId} />
      </div>
      <ClearEditorPlugin />
      <HistoryPlugin />
      <LinkPlugin />
      <AutoLink />
      <ImagesPlugin />
      <AutoEmbedPlugin />
      <YouTubePlugin />
      <MaxLengthPlugin maxLength={1024} />
    </LexicalComposer>
  );
};

export default memo(Editor);
