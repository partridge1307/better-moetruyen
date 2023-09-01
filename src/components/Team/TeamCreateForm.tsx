'use client';

import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { TeamPayload, TeamValidator } from '@/lib/validators/team';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import TeamDescForm from './components/TeamDescForm';
import TeamImageForm from './components/TeamImageForm';
import TeamNameForm from './components/TeamNameForm';

const TeamCreateForm = () => {
  const router = useRouter();
  const { loginToast, serverErrorToast, successToast } = useCustomToast();

  const form = useForm<TeamPayload>({
    resolver: zodResolver(TeamValidator),
    defaultValues: {
      image: undefined,
      name: '',
      description: '',
    },
  });

  const { mutate: Create, isLoading: isCreating } = useMutation({
    mutationFn: async (values: TeamPayload) => {
      const { image, name, description } = values;

      const form = new FormData();

      const blob = await fetch(image).then((res) => res.blob());
      form.append('image', blob);

      form.append('name', name);
      form.append('description', description);

      await axios.post(`/api/team`, form);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 400)
          return toast({
            title: 'Trùng lặp Team',
            description:
              'Có vẻ như Team đã bị tạo trước đó rồi. Vui lòng tạo team khác',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push('/me/team');
      router.refresh();

      return successToast();
    },
  });

  function onSubmitHandler(values: TeamPayload) {
    Create(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <TeamImageForm form={form} />

        <TeamNameForm form={form} />

        <TeamDescForm form={form} />

        <Button
          isLoading={isCreating}
          disabled={isCreating}
          type="submit"
          className="w-full"
        >
          Tạo
        </Button>
      </form>
    </Form>
  );
};

export default TeamCreateForm;
