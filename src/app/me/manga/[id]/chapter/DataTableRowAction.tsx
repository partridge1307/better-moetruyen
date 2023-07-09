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
  const { loginToast, notFoundToast } = useCustomToast();

  const { mutate: publish, isLoading: isPublishLoading } = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axios.patch(`/api/chapter/${id}/publish`);

      return data as string;
    },
    onError: (e) => {
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) return loginToast();
        if (e.response?.status === 400)
          return toast({
            title: 'Manga chưa publish',
            description: 'Yêu cầu Manga đã publish để thực hiện tính năng này',
            variant: 'destructive',
          });
        if (e.response?.status === 404) return notFoundToast();
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
        <Button variant="ghost" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-[200px]">
        <DropdownMenuItem asChild>
          <Link
            href={`/me/chapter/${chapter.mangaId}`}
            className={cn(buttonVariants({ variant: 'ghost' }), 'w-full')}
          >
            Sửa chapter
          </Link>
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
                    'bg-red-500 hover:bg-red-400 dark:text-white'
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
