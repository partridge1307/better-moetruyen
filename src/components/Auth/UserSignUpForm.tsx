'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import {
  AuthSignUpValidator,
  CreateAuthSignUpPayload,
} from '@/lib/validators/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
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

const UserSignUpForm = () => {
  const { serverErrorToast } = useCustomToast();
  const form = useForm<CreateAuthSignUpPayload>({
    resolver: zodResolver(AuthSignUpValidator),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const { mutate: signUp, isLoading } = useMutation({
    mutationFn: async (values: CreateAuthSignUpPayload) => {
      const signUpForm = AuthSignUpValidator.parse(values);

      const { data } = await axios.post('/api/auth/sign-up', signUpForm);

      return data as string;
    },
    onError: (e) => {
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) {
          return toast({
            title: 'Tài khoản đã được tạo',
            description: 'Vui lòng tạo tài khoản khác',
            variant: 'destructive',
          });
        }
        if (e.response?.status === 400) {
          return toast({
            title: 'Không thể gửi Email',
            variant: 'destructive',
          });
        }
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      return toast({
        title: 'Thành công',
        description: 'Một đường dẫn xác thực đã gửi tới mail của bạn',
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values: CreateAuthSignUpPayload) =>
          signUp(values)
        )}
        className="space-y-4 md:max-w-xl xl:max-w-2xl"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormMessage />
              <FormControl>
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  className="border-2 focus:ring-offset-2 dark:border-slate-200 focus-visible:dark:ring-slate-200"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormMessage />
              <FormControl>
                <Input
                  type="password"
                  placeholder="Mật khẩu của bạn"
                  className="border-2 focus:ring-offset-2 dark:border-slate-200 focus-visible:dark:ring-slate-200"
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
              <FormLabel>Nhập lại password</FormLabel>
              <FormMessage />
              <FormControl>
                <Input
                  type="password"
                  placeholder="Mật khẩu của bạn"
                  className="border-2 focus:ring-offset-2 dark:border-slate-200 focus-visible:dark:ring-slate-200"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full"
        >
          Đăng ký
        </Button>
      </form>
    </Form>
  );
};

export default UserSignUpForm;
