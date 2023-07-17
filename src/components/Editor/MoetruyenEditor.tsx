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

function onError(error: Error): void {
  console.log(error);
}

const editorConfig: InitialConfigType = {
  namespace: 'MoetruyenEditor',
  theme,
  onError,
  nodes: [...nodes],
};

export default function Editor(): JSX.Element {
  return (
    <>
      <LexicalComposer initialConfig={editorConfig}>
        <div className="moetruyen-editor-wrapper">
          <Toolbar />
          <div className="moetruyen-editor-inner">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="moetruyen-editor-input" />
              }
              placeholder={
                <div className="moetruyen-placeholder">Nhập nội dung...</div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
        </div>
        <Submit />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <LinkPlugin />
        <AutoLink />
        <ImagesPlugin />
        <EmojisPlugin />
        <AutoEmbedPlugin />
        <YouTubePlugin />
        <MaxLengthPlugin maxLength={50} />
        <CharacterLimitPlugin charset="UTF-8" maxLength={50} />
      </LexicalComposer>
    </>
  );
}
