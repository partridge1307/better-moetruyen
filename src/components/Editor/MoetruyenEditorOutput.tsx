'use client';

import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { nodes } from './Node';
import { theme } from './Theme';
import AutoEmbedPlugin from './plugins/AutoEmbed';
import AutoLink from './plugins/AutoLink';
import EmojisPlugin from './plugins/Emoji';
import ImagesPlugin from './plugins/Image';
import YouTubePlugin from './plugins/Youtube';
import testContent from './test.json';

function onError(error: Error): void {
  console.log(error);
}

function LoadContent() {
  if (testContent.oEmbed)
    return {
      content: JSON.stringify(testContent.data),
      oEmbed: testContent.oEmbed,
    };
  else return { content: JSON.stringify(testContent.data), oEmbed: null };
}
const MoetruyenEditorOutput = () => {
  const { content, oEmbed } = LoadContent();

  const editorConfig: InitialConfigType = {
    namespace: 'MoetruyenEditor',
    editable: false,
    theme,
    onError,
    nodes: [...nodes],
    editorState: content,
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="moetruyen-editor-wrapper">
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
      <div>
        <p>{oEmbed?.link}</p>
        <p>{oEmbed?.meta.title}</p>
      </div>
      <LinkPlugin />
      <AutoLink />
      <ImagesPlugin />
      <EmojisPlugin />
      <AutoEmbedPlugin />
      <YouTubePlugin />
    </LexicalComposer>
  );
};

export default MoetruyenEditorOutput;
