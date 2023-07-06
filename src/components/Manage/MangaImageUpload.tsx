import { type Dispatch, FC, type SetStateAction } from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/Form';
import { Input } from '../ui/Input';
import Image from 'next/image';
import { ImagePlus } from 'lucide-react';
import type { MangaUploadPayload } from '@/lib/validators/upload';
import type { UseFormReturn } from 'react-hook-form';

interface MangaImageUploadProps {
  form: UseFormReturn<MangaUploadPayload>;
  setPreviewImage: Dispatch<SetStateAction<string | undefined>>;
  previewImage?: string;
}

const MangaImageUpload: FC<MangaImageUploadProps> = ({
  form,
  setPreviewImage,
  previewImage,
}) => {
  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ảnh bìa</FormLabel>
          <FormMessage />
          <FormControl>
            <div className="relative w-40 h-40 border rounded-lg">
              <Input
                ref={field.ref}
                type="file"
                accept=".jpg, .jpeg, .png"
                className="absolute w-full h-full opacity-0 z-10"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    field.onChange(e.target.files[0]);
                    setPreviewImage(URL.createObjectURL(e.target.files[0]));
                  }
                }}
              />
              {!!previewImage ? (
                <Image
                  fill
                  src={previewImage!}
                  alt="Preview Manga Image"
                  className="object-cover rounded-lg"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <ImagePlus className="h-8 w-8" />
                </div>
              )}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default MangaImageUpload;
