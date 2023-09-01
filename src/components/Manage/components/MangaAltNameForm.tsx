import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { MangaUploadPayload } from '@/lib/validators/manga';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface MangaAltNameFormProps {
  form: UseFormReturn<MangaUploadPayload>;
}

const MangaAltNameForm: FC<MangaAltNameFormProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="altName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tên khác(Nếu có)</FormLabel>
          <FormMessage />
          <FormControl>
            <Input placeholder="Tên khác" autoComplete="off" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default MangaAltNameForm;