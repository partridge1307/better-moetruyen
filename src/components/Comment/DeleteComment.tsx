import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Loader2, X } from 'lucide-react';
import type { Session } from 'next-auth';
import { FC } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/AlertDialog';

interface DeleteCommentProps {
  commentId: number;
  session: Session | null;
  authorId: string;
}

const DeleteComment: FC<DeleteCommentProps> = ({
  commentId,
  session,
  authorId,
}) => {
  const { loginToast, notFoundToast } = useCustomToast();
  const { mutate: Delete, isLoading: isDeleting } = useMutation({
    mutationKey: ['delete-comment', `${commentId}`],
    mutationFn: async () => {
      await axios.delete(`/api/comment/${commentId}`);
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
      return toast({
        title: 'Thành công',
      });
    },
  });

  return (
    session?.user.id === authorId && (
      <AlertDialog>
        <AlertDialogTrigger
          disabled={isDeleting}
          className="hover:bg-red-500 text-red-500 hover:text-white transition-colors p-2 rounded-md"
        >
          {isDeleting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <X className="w-5 h-5" />
          )}
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận lại yêu cầu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bình luận này?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-red-500 text-white hover:bg-red-700">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => Delete()}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  );
};

export default DeleteComment;
