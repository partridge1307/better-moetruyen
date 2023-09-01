import { AspectRatio } from '@/components/ui/AspectRatio';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { TeamPayload } from '@/lib/validators/team';
import Image from 'next/image';
import { FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import dynamic from 'next/dynamic';
import { ImagePlus } from 'lucide-react';

const ImageCropModal = dynamic(() => import('@/components/ImageCropModal'), {
  ssr: false,
});

interface TeamImageFormProps {
  form: UseFormReturn<TeamPayload>;
}

const TeamImageForm: FC<TeamImageFormProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ảnh</FormLabel>
          <FormMessage />
          <FormControl>
            <AspectRatio ratio={1 / 1}>
              {!!field.value ? (
                <Image
                  fill
                  sizes="(max-width: 640px): 25vw, 30vw"
                  quality={40}
                  priority
                  src={field.value}
                  alt="Team Image Preview"
                  className="object-cover rounded-full hover:cursor-pointer border-dashed border-2 dark:border-zinc-800"
                  role="button"
                  onClick={() => {
                    const target = document.getElementById(
                      'team-image-add'
                    ) as HTMLInputElement;

                    target.click();
                  }}
                />
              ) : (
                <div
                  className="w-full h-full flex justify-center items-center hover:cursor-pointer border-dashed border-2 dark:border-zinc-800"
                  role="button"
                  onClick={() => {
                    const target = document.getElementById(
                      'team-image-add'
                    ) as HTMLInputElement;

                    target.click();
                  }}
                >
                  <ImagePlus className="w-10 h-10 opacity-50" />
                </div>
              )}
            </AspectRatio>
          </FormControl>
          <input
            id="team-image-add"
            type="file"
            accept=".jpg, .jpeg, .png"
            className="hidden"
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
                e.target.value = '';
              }
            }}
          />
          <ImageCropModal
            image={field.value}
            aspect={1 / 1}
            setImageCropped={(value) => field.onChange(value)}
          />
        </FormItem>
      )}
    />
  );
};

export default TeamImageForm;
