'use client';

import { cn, formatTimeToNow } from '@/lib/utils';
import { Clock, Loader2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useContext, useRef, useState } from 'react';
import { ConversationContext } from '../Navbar/ChatSidebar';
import UserAvatar from '../User/UserAvatar';
import Username from '../User/Username';
import { ScrollArea } from '../ui/ScrollArea';
import { Skeleton } from '../ui/Skeleton';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
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
import { buttonVariants } from '../ui/Button';

const ChatList = () => {
  const conversation = useContext(ConversationContext);
  const { data: session, status } = useSession();
  const { loginToast, notFoundToast } = useCustomToast();
  const router = useRouter();
  const [currentId, setCurrentId] = useState<number | null>(null);
  const dialogRef = useRef<HTMLButtonElement | null>(null);

  const { mutate: Delete, isLoading: isDeleting } = useMutation({
    mutationFn: async () => {
      if (!currentId) return;

      await axios.delete(`/api/conversation?id=${currentId}`, {
        data: { id: currentId },
      });
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
      router.push('/chat');
      router.refresh();

      return toast({
        title: 'Thành công',
      });
    },
  });

  if (status === 'loading')
    return (
      <div className="relative w-full flex items-center gap-2">
        <Skeleton className="w-12 h-12 rounded-full dark:bg-zinc-800" />
        <div className="relative w-full space-y-2">
          <Skeleton className="w-full h-4 roudned-full dark:bg-zinc-800" />
          <Skeleton className="w-full h-4 rounded-full dark:bg-zinc-800" />
        </div>
      </div>
    );

  return (
    <>
      <ScrollArea type="scroll" scrollHideDelay={300} className="h-full">
        <ul className="space-y-2">
          {conversation ? (
            conversation.map((con, index) => {
              const user = con.users.find(
                (user) => user.id !== session?.user.id
              );

              if (user)
                return (
                  <li key={index} className="relative">
                    <Link
                      href={`/chat?id=${con.id}`}
                      className="w-full flex items-center gap-4 p-2 dark:bg-zinc-800 rounded-lg"
                    >
                      {user.image ? (
                        <UserAvatar
                          user={user}
                          className="w-10 h-10 md:w-12 md:h-12"
                        />
                      ) : null}

                      <div>
                        <Username
                          user={user}
                          className="max-sm:text-sm text-start"
                        />
                        <p className="flex items-center gap-1 max-sm:text-xs text-sm">
                          <Clock className="w-4 h-4" />
                          {formatTimeToNow(new Date(con.createdAt))}
                        </p>
                      </div>
                    </Link>

                    {isDeleting ? (
                      <Loader2 className="absolute top-1/2 -translate-y-1/2 right-2 animate-spin" />
                    ) : (
                      <X
                        role="button"
                        className="text-red-500 absolute top-1/2 -translate-y-1/2 right-2"
                        onClick={() => {
                          dialogRef.current?.click();
                          setCurrentId(con.id);
                        }}
                      />
                    )}
                  </li>
                );
            })
          ) : (
            <li className="text-center">Bạn chưa có hội thoại nào.</li>
          )}
        </ul>
      </ScrollArea>

      <AlertDialog>
        <AlertDialogTrigger
          ref={(e) => {
            dialogRef.current = e;
          }}
          className="hidden"
        >
          Delete Dialog
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận lại yêu cầu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hội thoại này?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              className={cn(buttonVariants({ variant: 'destructive' }))}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={() => Delete()}>
              Chắc chắn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChatList;
