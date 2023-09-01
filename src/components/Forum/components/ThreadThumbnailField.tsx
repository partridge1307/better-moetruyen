import { buttonVariants } from '@/components/ui/Button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { cn } from '@/lib/utils';
import type { CreateThreadPayload } from '@/lib/validators/forum';
import { ImagePlus, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';

const ImageCropModal = dynamic(() => import('@/components/ImageCropModal'), {
  ssr: false,
});

interface ThreadThumbnailFieldProps {
  form: UseFormReturn<CreateThreadPayload>;
}

const ThreadThumbnailField: FC<ThreadThumbnailFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="thumbnail"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ảnh bìa (Nếu có)</FormLabel>
          <FormMessage />
          <FormControl>
            {field.value?.length ? (
              <div className="relative w-full pt-[56.25%] rounded-md border-2 border-dashed">
                <Image
                  fill
                  sizes="70vw"
                  quality={40}
                  priority
                  src={field.value}
                  alt="Preview Sub Forum Banner Image"
                  className="rounded-md object-top object-cover"
                  aria-label="change thumbnail button"
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();

                    const target = document.getElementById(
                      'thumbnail-input'
                    ) as HTMLInputElement;
                    target.click();
                  }}
                />
                <button
                  type="button"
                  className={cn(
                    buttonVariants({ variant: 'destructive', size: 'xs' }),
                    'absolute right-0 top-0 translate-x-1/3 -translate-y-1/3'
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    field.onChange('');
                  }}
                >
                  <Trash2
                    aria-label="delete thumbnail button"
                    className="w-5 h-5"
                  />
                </button>
              </div>
            ) : (
              <div
                role="button"
                className="relative w-full pt-[56.25%] rounded-md border-2 border-dashed"
                aria-label="add image button"
                onClick={(e) => {
                  e.preventDefault();

                  const target = document.getElementById(
                    'thumbnail-input'
                  ) as HTMLInputElement;
                  target.click();
                }}
              >
                <ImagePlus className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-20 h-20 opacity-70" />
              </div>
            )}
          </FormControl>
          <input
            id="thumbnail-input"
            className="hidden"
            type="file"
            accept=".jpg, .jpeg, .png"
            onChange={(e) => {
              if (
                e.target.files?.length &&
                e.target.files[0].size < 4 * 1000 * 1000
              ) {
                field.onChange(URL.createObjectURL(e.target.files[0]));

                const target = document.getElementById(
                  'crop-modal-button'
                ) as HTMLButtonElement;
                target.click();
              }
            }}
          />
          <ImageCropModal
            image={field.value ?? ''}
            aspect={16 / 9}
            setImageCropped={(value) => field.onChange(value)}
          />
        </FormItem>
      )}
    />
  );
};

export default ThreadThumbnailField;
