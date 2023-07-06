import { type Dispatch, FC, type SetStateAction } from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/Form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';
import { Input } from '../ui/Input';
import type { ChapterUploadPayload } from '@/lib/validators/upload';
import type { UseFormReturn } from 'react-hook-form';

interface ChapterIndexUploadProps {
  form: UseFormReturn<ChapterUploadPayload>;
  setDisableChapterIndex: Dispatch<SetStateAction<boolean>>;
  disaleChapterIndex: boolean;
}

const ChapterIndexUpload: FC<ChapterIndexUploadProps> = ({
  form,
  setDisableChapterIndex,
  disaleChapterIndex,
}) => {
  return (
    <FormField
      control={form.control}
      name="chapterIndex"
      render={({ field }) => (
        <FormItem>
          <FormLabel>STT chapter</FormLabel>
          <FormMessage />
          <FormControl>
            <div>
              <Select
                onValueChange={(value) => {
                  if (value === 'custom') setDisableChapterIndex(false);
                  else if (value === 'append') {
                    field.onChange(0);
                    setDisableChapterIndex(true);
                  }
                }}
                defaultValue="append"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="append">Sau chapter mới nhất</SelectItem>
                    <SelectItem value="custom">Tự điền</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input
                ref={field.ref}
                disabled={disaleChapterIndex}
                type="number"
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                onBlur={field.onBlur}
              />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default ChapterIndexUpload;
