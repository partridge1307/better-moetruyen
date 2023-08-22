import { Button } from '@/components/ui/Button';
import { useFetchOEmbed } from '@/hooks/use-fetch-oEmbed';
import { useUploadComment } from '@/hooks/use-upload-comment';
import { cn } from '@/lib/utils';
import { AutoLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useState } from 'react';
import { $isImageNode, type ImageNode } from '../../nodes/Image';
import type { CreateCommentEnum } from '@/lib/validators/comment';

export default function Submit({
  id,
  type,
  callbackURL,
}: {
  id: number;
  type: CreateCommentEnum;
  callbackURL: string;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [hasText, setHasText] = useState<boolean>(false);
  const { mutate: Upload, isLoading: isUpload } = useUploadComment(editor);
  const {
    data: oEmbedData,
    mutate: Embed,
    isLoading: isFetchingOEmbed,
  } = useFetchOEmbed();

  useEffect(() => {
    editor.registerTextContentListener((text) => {
      if (text) {
        setHasText(true);
      } else {
        setHasText(false);
      }
    });
  }, [editor]);

  useEffect(() => {
    if (typeof oEmbedData !== 'undefined' && !isFetchingOEmbed) {
      Upload({
        payload: {
          type,
          id,
          content: editor.getEditorState().toJSON(),
          oEmbed: oEmbedData,
        },
        callbackURL,
      });
    }
  }, [Upload, callbackURL, editor, id, isFetchingOEmbed, oEmbedData, type]);

  const onClick = useCallback(() => {
    const editorState = editor.getEditorState();
    let autoLink: AutoLinkNode | undefined, imageNode: ImageNode | undefined;

    if (editor.isEditable()) editor.setEditable(false);

    editorState._nodeMap.forEach((node) => {
      if (node instanceof AutoLinkNode) {
        autoLink = node;
      } else if ($isImageNode(node)) {
        imageNode = node;
      }
    });

    if (imageNode || !autoLink) {
      Upload({
        payload: { type, id, content: editorState.toJSON() },
        callbackURL,
      });
    } else {
      Embed(autoLink.__url);
    }
  }, [Embed, Upload, callbackURL, editor, id, type]);

  return (
    <Button
      disabled={!hasText}
      isLoading={isUpload}
      className={cn('w-full transition-opacity', {
        'opacity-50': !hasText,
      })}
      onClick={() => onClick()}
    >
      Đăng
    </Button>
  );
}
