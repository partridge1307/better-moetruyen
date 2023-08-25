import type { CreateCommentPayload } from '@/lib/validators/comment';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useCustomToast } from './use-custom-toast';
import { CLEAR_EDITOR_COMMAND, type LexicalEditor } from 'lexical';

export const useUploadComment = (
  editor: LexicalEditor | null,
  refetch?: () => void
) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();

  return useMutation({
    mutationKey: ['comment-upload-query'],
    mutationFn: async ({
      payload,
      callbackURL,
    }: {
      payload: CreateCommentPayload;
      callbackURL: string;
    }) => {
      await axios.post(callbackURL, payload);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      if (!editor?.isEditable()) editor?.setEditable(true);
      editor?.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);

      !!refetch && refetch();

      return successToast();
    },
  });
};
