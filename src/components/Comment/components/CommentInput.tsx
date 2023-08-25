'use client';

import { $isImageNode, type ImageNode } from '@/components/Editor/nodes/Image';
import { Button } from '@/components/ui/Button';
import { useFetchOEmbed } from '@/hooks/use-fetch-oEmbed';
import { useUploadComment } from '@/hooks/use-upload-comment';
import { cn } from '@/lib/utils';
import type { CreateCommentEnum } from '@/lib/validators/comment';
import { AutoLinkNode } from '@lexical/link';
import type { EditorState, LexicalEditor } from 'lexical';
import { FC, Suspense, lazy, useCallback, useEffect, useState } from 'react';

const MoetruyenEditor = lazy(
  () => import('@/components/Editor/MoetruyenEditor')
);

interface CommentInputProps {
  isLoggedIn: boolean;
  id: number;
  type: CreateCommentEnum;
  callbackURL: string;
  refetch?: () => void;
}

const CommentInput: FC<CommentInputProps> = ({
  isLoggedIn,
  id,
  type,
  callbackURL,
  refetch,
}) => {
  const [editor, setEditor] = useState<LexicalEditor | null>(null);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [hasText, setHasText] = useState(false);

  const { mutate: Upload, isLoading: isUpload } = useUploadComment(
    editor,
    refetch
  );
  const {
    data: oEmbedData,
    mutate: Embed,
    isLoading: isFetchingOEmbed,
  } = useFetchOEmbed();

  useEffect(() => {
    if (editor) {
      editor.registerTextContentListener((text) => {
        text.length ? setHasText(true) : setHasText(false);
      });
    }
  }, [editor]);

  useEffect(() => {
    if (typeof oEmbedData !== 'undefined' && !isFetchingOEmbed && editor) {
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
    if (editor) {
      if (editor.isEditable()) editor.setEditable(false);

      let autoLinkNode: AutoLinkNode | undefined,
        imageNode: ImageNode | undefined;

      editorState?._nodeMap.forEach((node) => {
        if (node instanceof AutoLinkNode) {
          autoLinkNode = node;
        } else if ($isImageNode(node)) {
          imageNode = node;
        }
      });

      if (imageNode || !autoLinkNode) {
        Upload({
          payload: { type, id, content: editor.getEditorState().toJSON() },
          callbackURL,
        });
      } else {
        Embed(autoLinkNode.__url);
      }
    }
  }, [editor, editorState?._nodeMap, type, id, callbackURL, Embed, Upload]);

  return isLoggedIn ? (
    <Suspense
      fallback={
        <div className="w-full h-44 rounded-md animate-pulse dark:bg-zinc-900" />
      }
    >
      <div className="container px-0 md:px-16 lg:px-20 space-y-4">
        <MoetruyenEditor editor={setEditor} onChange={setEditorState} />
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
      </div>
    </Suspense>
  ) : (
    <div>
      Vui lòng <span className="font-semibold">đăng nhập</span> hoặc{' '}
      <span className="font-semibold">đăng ký</span> để comment
    </div>
  );
};

export default CommentInput;
