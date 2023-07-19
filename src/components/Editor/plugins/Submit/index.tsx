import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { CommentContentPayload } from '@/lib/validators/upload';
import { AutoLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { $isImageNode, ImageNode } from '../../nodes/Image';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { startTransition } from 'react';

export default function Submit({ id }: { id: string }): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [hasText, setHasText] = useState<boolean>(false);
  const { loginToast, notFoundToast } = useCustomToast();
  const router = useRouter();

  const {
    data: oEmbedData,
    mutate: Embed,
    isLoading: isFetchingOEmbed,
  } = useMutation({
    mutationFn: async (linkUrl: string) => {
      const { link, meta } = await (
        await fetch(`/api/link?url=${linkUrl}`)
      ).json();

      return { link, meta };
    },
  });
  const { mutate: Upload } = useMutation({
    mutationFn: async (values: CommentContentPayload) => {
      const { data } = await axios.put(`/api/comment/${id}/create`, values);

      return data as string;
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
      startTransition(() => router.refresh());
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

  const onClick = useCallback(() => {
    const editorState = editor.getEditorState();
    let autoLink: AutoLinkNode | undefined, imageNode: ImageNode | undefined;
    editorState._nodeMap.forEach((node) => {
      if (node instanceof AutoLinkNode) {
        autoLink = node;
      } else if ($isImageNode(node)) {
        imageNode = node;
      }
    });

    if (imageNode) {
      Upload({ content: editorState.toJSON() });
    } else {
      if (autoLink) {
        Embed(autoLink.__url);
      }
      Upload({ content: editorState.toJSON() });
    }
  }, [Embed, Upload, editor]);

  if (typeof oEmbedData !== 'undefined' && !isFetchingOEmbed) {
    Upload({ content: editor.getEditorState().toJSON(), oEmbed: oEmbedData });
  }

  return (
    <Button
      disabled={!hasText}
      className={cn('w-full transition-opacity', !hasText && 'opacity-50')}
      onClick={() => onClick()}
    >
      Đăng
    </Button>
  );
}
