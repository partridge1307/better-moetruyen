import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import {
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
} from 'lexical';
import { useEffect } from 'react';
import { $createEmbedLinkNode, EmbedLinkNode } from '../../nodes/EmbedLink';

export const INSERT_EMBED_LINK_COMMAND: LexicalCommand<{
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
}> = createCommand('INSERT_EMBED_LINK_COMMAND');

export default function EmbedLinkPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([EmbedLinkNode])) {
      throw new Error(
        'EmbedLinkPlugin: EmbedLinkNode not registered on editor'
      );
    }

    return editor.registerCommand<{
      id: string;
      description: string | null;
      title: string | null;
      imageUrl: string;
    }>(
      INSERT_EMBED_LINK_COMMAND,
      (payload) => {
        const embedLinkNode = $createEmbedLinkNode({
          link: payload.id,
          title: payload.title,
          description: payload.description,
          imageUrl: payload.imageUrl,
        });
        $insertNodeToNearestRoot(embedLinkNode);

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
