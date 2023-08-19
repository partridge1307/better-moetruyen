'use client';

import { Flag } from 'lucide-react';
import { FC, memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';
import { useForm } from 'react-hook-form';
import {
  ChapterReportPayload,
  ChapterReportValidator,
} from '@/lib/validators/chapter';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/Form';
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup';
import { Label } from '../ui/Label';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ChapterProps {
  id: number;
}

const Chapter: FC<ChapterProps> = ({ id }) => {
  const form = useForm<ChapterReportPayload>({
    resolver: zodResolver(ChapterReportValidator),
    defaultValues: {
      id,
      type: undefined,
      content: '',
    },
  });

  function onSubmitHandler(values: ChapterReportPayload) {
    console.log(values);
  }

  return (
    <Dialog>
      <DialogTrigger className="w-full flex justify-center items-center py-2 gap-2 mt-4 rounded-lg text-lg dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-700/70 dark:hover:text-white/80">
        <Flag className="w-5 h-5" /> Báo cáo
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Báo cáo</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitHandler)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Báo vi phạm</FormLabel>
                  <FormMessage />
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="violate" id="violate" />
                        <Label htmlFor="violate">Luật</Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="image-die" id="image-die" />
                        <Label htmlFor="image-die">Die ảnh</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trình bày vi phạm</FormLabel>
                  <FormMessage />
                  <FormControl>
                    <Input placeholder="Nội dung" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Báo cáo
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default memo(Chapter);
