import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { TeamPayload } from '@/lib/validators/team';
import { FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';

interface TeamDescFormProps {
  form: UseFormReturn<TeamPayload>;
}

const TeamDescForm: FC<TeamDescFormProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Mô tả</FormLabel>
          <FormMessage />
          <FormControl>
            <Input placeholder="Mô tả" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default TeamDescForm;
