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
import type { Chapter } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import type { Row } from '@tanstack/react-table';
import axios, { AxiosError } from 'axios';
import { Loader2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DataTableRowActionProps {
  row: Row<
    Pick<
      Chapter,
      'id' | 'name' | 'images' | 'isPublished' | 'mangaId' | 'updatedAt'
    >
  >;
}

function DataTableRowAction({ row }: DataTableRowActionProps) {
  const chapter = row.original;
  const { loginToast, notFoundToast } = useCustomToast();
  const { refresh } = useRouter();

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
            description: 'Yêu cầu Manga đã publish để thực hiện',
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
          <Link href={`/me/chapter/${chapter.id}`} className="w-full">
            Sửa chapter
          </Link>
        </DropdownMenuItem>

        {chapter.isPublished ? (
          <DropdownMenuItem>
            <Link href={`/chapter/${chapter.id}`} className="w-full">
              Xem chapter
            </Link>
          </DropdownMenuItem>
        ) : (
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
                  <span className="font-bold">publish</span> chapter này hay
                  chưa?
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel
                  className={buttonVariants({ variant: 'destructive' })}
                >
                  Chờ chút đã
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => publish(chapter.id)}>
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