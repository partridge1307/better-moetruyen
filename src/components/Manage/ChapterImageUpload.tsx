import { type Dispatch, FC, type SetStateAction } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/Form";
import { Input } from "../ui/Input";
import type { ChapterUploadPayload } from "@/lib/validators/upload";
import type { UseFormReturn } from "react-hook-form";

export type previewImage = {
  link: string;
  name: string;
  type: string;
  size: number;
  progress?: number | null;
  done?: boolean;
};

interface ChapterImageUploadProps {
  form: UseFormReturn<ChapterUploadPayload>;
  setInputImage: Dispatch<SetStateAction<previewImage[]>>;
}

const ChapterImageUpload: FC<ChapterImageUploadProps> = ({
  form,
  setInputImage,
}) => {
  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ảnh</FormLabel>
          <FormMessage />
          <FormControl>
            <Input
              ref={field.ref}
              type="file"
              multiple
              accept=".jpg, .png, .jpeg"
              onChange={(e) => {
                if (e.target.files?.length) {
                  field.onChange(e.target.files);
                  let imageObject = [];
                  for (let i = 0; i < e.target.files.length; i++) {
                    imageObject.push({
                      link: URL.createObjectURL(e.target.files.item(i)!),
                      name: e.target.files.item(i)!.name.split(".")[0],
                      type: e.target.files.item(i)!.name.split(".")[1],
                      size: Math.floor(e.target.files.item(i)!.size / 1000),
                    });
                  }
                  setInputImage(imageObject);
                }
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default ChapterImageUpload;
