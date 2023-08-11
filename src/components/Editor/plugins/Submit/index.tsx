/* eslint-disable no-unused-vars */
import { Button } from '@/components/ui/Button';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { socket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { CommentContentPayload } from '@/lib/validators/upload';
import { AutoLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { CLEAR_EDITOR_COMMAND } from 'lexical';
import { useCallback, useEffect, useState } from 'react';
import { $isImageNode, ImageNode } from '../../nodes/Image';

export default function Submit({
  id,
  commentId,
  chapterId,
}: {
  id: string;
  commentId?: number;
  chapterId?: number;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [hasText, setHasText] = useState<boolean>(false);
  const { loginToast, notFoundToast } = useCustomToast();

  const {
    data: oEmbedData,
    mutate: Embed,
    isLoading: isFetchingOEmbed,
  } = useMutation({
    mutationKey: ['oembed-query'],
    mutationFn: async (linkUrl: string) => {
      const { link, meta } = await (
        await fetch(`/api/link?url=${linkUrl}`)
      ).json();

      return { link, meta };
    },
  });
  const { mutate: Upload, isLoading: isUpload } = useMutation({
    mutationKey: ['comment-upload-query'],
    mutationFn: async (values: CommentContentPayload) => {
      if (chapterId) {
        const payload = {
          ...values,
          id,
        };
        await axios.put(`/api/chapter/${chapterId}/comment/create`, payload);
      } else {
        await axios.put(`/api/manga/${id}/comment/create`, values);

        if (commentId) {
          socket.emit('notify', { type: 'COMMENT', payload: commentId });
        }
      }
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return toast({
        title: 'Có lỗi xảy ra',
        description: 'Có lỗi xảy ra. Vui lòng thử lại sau',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      if (!editor.isEditable()) editor.setEditable(true);
      editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);

      return toast({
        title: 'Thành công',
      });
    },
  });

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
        content: editor.getEditorState().toJSON(),
        oEmbed: oEmbedData,
        commentId,
      });
    }
  }, [Upload, commentId, editor, isFetchingOEmbed, oEmbedData]);

  const onClick = useCallback(() => {
    const editorState = editor.getEditorState();
    if (editor.isEditable()) editor.setEditable(false);

    let autoLink: AutoLinkNode | undefined, imageNode: ImageNode | undefined;
    editorState._nodeMap.forEach((node) => {
      if (node instanceof AutoLinkNode) {
        autoLink = node;
      } else if ($isImageNode(node)) {
        imageNode = node;
      }
    });

    if (imageNode) {
      Upload({ content: editorState.toJSON(), commentId });
    } else {
      if (autoLink) {
        Embed(autoLink.__url);
      } else {
        Upload({ content: editorState.toJSON(), commentId });
      }
    }
  }, [Embed, Upload, commentId, editor]);

  return (
    <Button
      disabled={!hasText}
      isLoading={isUpload}
      className={cn('w-full transition-opacity', !hasText && 'opacity-50')}
      onClick={() => onClick()}
    >
      Đăng
    </Button>
  );
}
