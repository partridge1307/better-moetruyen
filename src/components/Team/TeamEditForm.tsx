'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { TeamPayload, TeamValidator } from '@/lib/validators/team';
import { zodResolver } from '@hookform/resolvers/zod';
import { Team } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Form } from '../ui/Form';
import TeamDescForm from './components/TeamDescForm';
import TeamImageForm from './components/TeamImageForm';
import TeamNameForm from './components/TeamNameForm';

interface TeamEditFormProps {
  team: Pick<Team, 'id' | 'name' | 'image' | 'description'>;
}

const TeamEditForm: FC<TeamEditFormProps> = ({ team }) => {
  const router = useRouter();
  const { loginToast, serverErrorToast, successToast, notFoundToast } =
    useCustomToast();

  const form = useForm<TeamPayload>({
    resolver: zodResolver(TeamValidator),
    defaultValues: {
      image: team.image,
      name: team.name,
      description: team.description,
    },
  });

  const { mutate: Edit, isLoading: isEditting } = useMutation({
    mutationFn: async (values: TeamPayload) => {
      const { image, name, description } = values;

      const form = new FormData();
      if (image.startsWith('blob')) {
        const blob = await fetch(image).then((res) => res.blob());
        form.append('image', blob);
      } else {
        form.append('image', image);
      }
      form.append('name', name);
      form.append('description', description);

      await axios.patch(`/api/team/${team.id}`, form);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
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
    Edit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <TeamImageForm form={form} />

        <TeamNameForm form={form} />

        <TeamDescForm form={form} />

        <Button
          type="submit"
          isLoading={isEditting}
          disabled={isEditting}
          className="w-full"
        >
          Sửa
        </Button>
      </form>
    </Form>
  );
};

export default TeamEditForm;
