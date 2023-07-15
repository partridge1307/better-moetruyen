'use client';

import '@/styles/mteditor.css';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ImageNode } from './nodes/Image';
import AutoLink from './plugins/AutoLink';
import Toolbar from './plugins/Toolbar';
import ImagesPlugin from './plugins/Image';
import EmojisPlugin from './plugins/Emoji';
import { EmojiNode } from './nodes/Emoji';
import AutoEmbedPlugin from './plugins/AutoEmbed';
import YouTubePlugin from './plugins/Youtube';
import { YouTubeNode } from './nodes/Youtube';
import { EmbedLinkNode } from './nodes/EmbedLink';
import EmbedLinkPlugin from './plugins/EmbedLink';

function onError(error: Error): void {
  console.log(error);
}

const theme = {
  text: {
    bold: 'moetruyen-editor-bold',
    italic: 'moetruyen-editor-italic',
    underline: 'moetruyen-editor-underline',
    strikethrough: 'moetruyen-editor-strikethrough',
    underlineStrikethrough: 'moetruyen-editor-underlinestrikethrough',
  },
  link: 'moetruyen-editor-link',
  paragraph: 'moetruyen-editor-paragraph',
  image: 'moetruyen-editor-image',
};

const editorConfig = {
  namespace: 'MoetruyenEditor',
  theme,
  onError,
  nodes: [
    AutoLinkNode,
    LinkNode,
    ImageNode,
    EmojiNode,
    YouTubeNode,
    EmbedLinkNode,
  ],
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
        <HistoryPlugin />
        <AutoFocusPlugin />
        <LinkPlugin />
        <AutoLink />
        <ImagesPlugin />
        <EmojisPlugin />
        <AutoEmbedPlugin />
        <YouTubePlugin />
        <EmbedLinkPlugin />
      </LexicalComposer>
    </>
  );
}
