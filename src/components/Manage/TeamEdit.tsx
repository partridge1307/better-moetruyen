'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { TeamEditPayload, TeamEditValidator } from '@/lib/validators/team';
import { zodResolver } from '@hookform/resolvers/zod';
import { Team } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/Form';
import { Input } from '../ui/Input';

interface TeamEditProps {
  team: Pick<Team, 'id' | 'name' | 'image' | 'description'>;
}

const TeamEdit: FC<TeamEditProps> = ({ team }) => {
  const { loginToast, serverErrorToast, successToast, notFoundToast } =
    useCustomToast();
  const router = useRouter();

  const form = useForm<TeamEditPayload>({
    resolver: zodResolver(TeamEditValidator),
    defaultValues: {
      image: team.image,
      name: team.name,
      description: team.description,
    },
  });

  const { mutate: Edit, isLoading: isEditting } = useMutation({
    mutationFn: async (values: TeamEditPayload) => {
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

  function onSubmitHandler(values: TeamEditPayload) {
    Edit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ảnh</FormLabel>
              <FormMessage />
              <FormControl>
                <Image
                  width={0}
                  height={0}
                  sizes="100vw"
                  priority
                  src={field.value}
                  alt="Team Image Preview"
                  className="w-32 h-44 object-cover cursor-pointer"
                  onClick={() => {
                    const target = document.getElementById(
                      'team-image-add'
                    ) as HTMLInputElement;

                    target.click();
                  }}
                />
              </FormControl>
              <Input
                id="team-image-add"
                type="file"
                accept=".jpg, .jpeg, .png"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    const file = e.target.files[0];
                    if (file.size < 4 * 1000 * 1000) {
                      const url = URL.createObjectURL(file);
                      field.onChange(url);
                    }
                  }
                }}
              />
            </FormItem>
          )}
        />

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

export default TeamEdit;
