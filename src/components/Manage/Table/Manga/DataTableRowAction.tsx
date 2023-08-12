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
import type { Manga } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import type { Row } from '@tanstack/react-table';
import axios, { AxiosError } from 'axios';
import { Loader2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DataTableRowActionProps {
  row: Row<Pick<Manga, 'id' | 'name' | 'isPublished' | 'updatedAt'>>;
}

function DataTableRowAction({ row }: DataTableRowActionProps) {
  const manga = row.original;
  const { refresh } = useRouter();
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
      refresh();

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
      <DropdownMenuContent className="max-w-[200px] space-y-2 p-2">
        <DropdownMenuItem>
          <Link href={`/me/manga/${manga.id}/edit`} className="w-full">
            Chỉnh sửa
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={`/me/manga/${manga.id}/chapter`} className="w-full">
            Xem chapter
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={`/me/manga/${manga.id}`} className="w-full">
            Thông tin truyện
          </Link>
        </DropdownMenuItem>

        {!manga.isPublished && (
          <AlertDialog>
            <AlertDialogTrigger
              disabled={isPublishLoading}
              className="w-full flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {isPublishLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <p>Publish</p>
              )}
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận lại yêu cầu</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn đã chắc chắn muốn{' '}
                  <span className="font-bold">publish</span> truyện này hay
                  chưa?
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel
                  className={buttonVariants({ variant: 'destructive' })}
                >
                  Chờ chút đã
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
