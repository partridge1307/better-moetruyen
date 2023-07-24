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
} from '@/components/ui/AlertDialog';
import { Button, buttonVariants } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Manga } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import type { Row } from '@tanstack/react-table';
import axios, { AxiosError } from 'axios';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition } from 'react';

interface DataTableRowActionProps {
  row: Row<Pick<Manga, 'id' | 'name' | 'isPublished' | 'updatedAt'>>;
}

function DataTableRowAction({ row }: DataTableRowActionProps) {
  const manga = row.original;
  const router = useRouter();
  const { loginToast, notFoundToast } = useCustomToast();

  const { mutate: publish, isLoading: isPublishLoading } = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axios.patch(`/api/manga/${id}/publish`);

      return data as string;
    },
    onError: (e) => {
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) return loginToast();
        if (e.response?.status === 403)
          return toast({
            title: 'Không thể publish',
            description: 'Yêu cầu manga phải có ít nhất 1 chapter',
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
        <DropdownMenuItem>
          <Link
            href={`/me/manga/${manga.id}/chapter`}
            className={cn(buttonVariants({ variant: 'ghost' }), 'w-full')}
          >
            Xem chapter
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            href={`/me/manga/${manga.id}`}
            className={cn(buttonVariants({ variant: 'ghost' }), 'w-full')}
          >
            Thông tin truyện
          </Link>
        </DropdownMenuItem>
        {!manga.isPublished && (
          <AlertDialog>
            <AlertDialogTrigger disabled={isPublishLoading} asChild>
              <Button variant="ghost" className="w-full">
                Publish
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận yêu cầu</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn đã chắc chắn muốn publish bộ này hay chưa?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className={cn(
                    buttonVariants(),
                    'bg-red-500 hover:bg-red-400 dark:text-white'
                  )}
                >
                  Cho tôi suy nghĩ thêm
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => publish(manga.id)}>
                  Tôi chắc chắn
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DataTableRowAction;
