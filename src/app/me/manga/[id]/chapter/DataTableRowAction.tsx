import { Button, buttonVariants } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/utils';
import type { Chapter } from '@prisma/client';
import { DialogClose } from '@radix-ui/react-dialog';
import { useMutation } from '@tanstack/react-query';
import type { Row } from '@tanstack/react-table';
import axios, { AxiosError } from 'axios';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';

interface DataTableRowActionProps {
  row: Row<Chapter>;
}

function DataTableRowAction({ row }: DataTableRowActionProps) {
  const chapter = row.original;
  const router = useRouter();
  const { loginToast } = useCustomToast();

  const { mutate: publish, isLoading: isPublishLoading } = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axios.patch(
        `/api/manga/${chapter.mangaId}/chapter/${id}`
      );

      return data as string;
    },
    onError: (e) => {
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) return loginToast();
        if (e.response?.status === 403)
          return toast({
            title: 'Không thể publish',
            description: 'Vui lòng thử lại',
            variant: 'destructive',
          });
        if (e.response?.status === 404)
          return toast({
            title: 'Không tìm thấy',
            description: 'Không tìm thấy chapter',
            variant: 'destructive',
          });
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-0 h-6 w-6">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-[200px]">
        <DropdownMenuItem asChild>
          <a
            href={`/me/manga/${chapter.mangaId}/chapter/${chapter.id}`}
            className={cn(buttonVariants({ variant: 'ghost' }), 'w-full')}
          >
            Sửa chapter
          </a>
        </DropdownMenuItem>
        {!chapter.isPublished && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full">
                Publish
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận yêu cầu</DialogTitle>
                <DialogDescription>
                  Bạn đã chắc chắn muốn publish chapter này hay chưa?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose
                  className={cn(
                    buttonVariants(),
                    'bg-red-500 dark:text-white hover:bg-red-400'
                  )}
                >
                  Cho tôi suy nghĩ thêm
                </DialogClose>
                <Button
                  isLoading={isPublishLoading}
                  onClick={() => publish(chapter.id)}
                >
                  Tôi chắc chắn
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DataTableRowAction;
