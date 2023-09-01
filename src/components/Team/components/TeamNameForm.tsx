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

interface TeamNameFormProps {
  form: UseFormReturn<TeamPayload>;
}

const TeamNameForm: FC<TeamNameFormProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tên Team</FormLabel>
          <FormMessage />
          <FormControl>
            <Input placeholder="Tên Team" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default TeamNameForm;
