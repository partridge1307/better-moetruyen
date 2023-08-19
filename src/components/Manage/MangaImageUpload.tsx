'use client';

import { FC } from 'react';
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
import type { MangaUploadPayload } from '@/lib/validators/manga';
import type { UseFormReturn } from 'react-hook-form';

interface MangaImageUploadProps {
  form: UseFormReturn<MangaUploadPayload>;
  setPreviewImage: React.Dispatch<React.SetStateAction<string | undefined>>;
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
          <FormLabel
            className="after:content-['*'] after:text-red-500 after:ml-0.5"
            title="Xem trước ở tỉ lệ của Tiêu Điểm. Còn lại Ảnh sẽ tự fill vừa với khung"
          >
            Ảnh bìa
          </FormLabel>
          <FormMessage />
          <FormControl>
            <div className="relative h-44 lg:h-72 w-52 lg:w-64 rounded-lg border">
              <Input
                ref={field.ref}
                type="file"
                accept=".jpg, .jpeg, .png"
                className="absolute z-10 h-full w-52 opacity-0 cursor-pointer"
                title=""
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
                  sizes="50vw"
                  quality={40}
                  priority
                  src={previewImage!}
                  alt="Preview Manga Image"
                  className="rounded-lg object-contain object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
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
