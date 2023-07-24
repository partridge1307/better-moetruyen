'use client';

import '@/styles/mteditor.css';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin';
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { nodes } from './Node';
import { theme } from './Theme';
import AutoEmbedPlugin from './plugins/AutoEmbed';
import AutoLink from './plugins/AutoLink';
import EmojisPlugin from './plugins/Emoji';
import ImagesPlugin from './plugins/Image';
import Submit from './plugins/Submit';
import Toolbar from './plugins/Toolbar';
import YouTubePlugin from './plugins/Youtube';
import { MaxLengthPlugin } from './plugins/MaxLength';
import { toast } from '@/hooks/use-toast';

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

export default function Editor({
  id,
  commentId,
  chapterId,
}: {
  id: string;
  commentId?: number;
  chapterId?: number;
}): JSX.Element {
  return (
    <>
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
              <CharacterLimitPlugin charset="UTF-8" maxLength={1024} />
            </div>
          </div>
          <Submit id={id} commentId={commentId} chapterId={chapterId} />
        </div>
        <HistoryPlugin />
        <AutoFocusPlugin />
        <LinkPlugin />
        <AutoLink />
        <ImagesPlugin />
        <EmojisPlugin />
        <AutoEmbedPlugin />
        <YouTubePlugin />
        <MaxLengthPlugin maxLength={1024} />
      </LexicalComposer>
    </>
  );
}
