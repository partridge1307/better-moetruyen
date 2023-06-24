'use client';

import { useToast } from '@/hooks/use-toast';
import {
  AuthSignUpValidator,
  CreateAuthSignUpPayload,
} from '@/lib/validators/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/Form';
import { Input } from './ui/Input';

const UserAuthSignUpForm = () => {
  const { toast } = useToast();
  const { refresh } = useRouter();
  const form = useForm<CreateAuthSignUpPayload>({
    resolver: zodResolver(AuthSignUpValidator),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
    },
  });
  const { mutate: signUp, isLoading } = useMutation({
    mutationFn: async (values: object) => {
      const { email, password, passwordConfirm } =
        AuthSignUpValidator.parse(values);

      const { data } = await axios.post('/api/auth/sign-up', {
        email,
        password,
        passwordConfirm,
      });

      return data as string;
    },
    onError: (e) => {
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) {
          return toast({
            title: e.message,
            description: 'Vui lòng tạo tài khoản khác',
            variant: 'destructive',
          });
        }
      }

      return toast({
        title: 'Có lỗi xảy ra',
        description: 'Vui lòng thử lại',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      startTransition(() => {
        refresh();
      });

      return toast({
        title: 'Thành công',
        description: 'Một đường dẫn xác thực đã gửi tới mail của bạn',
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => signUp(values))}
        className="space-y-3"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormMessage />
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email của bạn" type="email" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormMessage />
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <Input
                  placeholder="Mật khẩu của bạn"
                  type="password"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passwordConfirm"
          render={({ field }) => (
            <FormItem>
              <FormMessage />
              <FormLabel>Nhập lại mật khẩu</FormLabel>
              <FormControl>
                <Input
                  placeholder="Mật khẩu của bạn"
                  type="password"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          isLoading={isLoading}
          type="submit"
          variant="ghost"
          className="bg-black w-full"
        >
          Đăng ký
        </Button>
      </form>
    </Form>
  );
};

export default UserAuthSignUpForm;
