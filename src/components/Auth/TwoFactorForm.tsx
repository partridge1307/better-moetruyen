'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import {
  AuthTwoFactorPayload,
  AuthTwoFactorValidator,
} from '@/lib/validators/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { PinInput } from '@mantine/core';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Form, FormField, FormItem } from '../ui/Form';

interface TwoFactorProps {
  email: string;
  password: string;
}

const TwoFactorForm: FC<TwoFactorProps> = ({ email, password }) => {
  const { serverErrorToast, successToast } = useCustomToast();
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);

  const form = useForm<AuthTwoFactorPayload>({
    resolver: zodResolver(AuthTwoFactorValidator),
    defaultValues: {
      email,
      password,
      totp: '',
    },
  });

  async function onSubmitHandler(values: AuthTwoFactorPayload) {
    setLoading(true);

    try {
      const { email, password, totp } = values;

      const res = await signIn('two-factor', {
        email,
        password,
        totp,
        redirect: false,
      });

      if (res?.error === 'CredentialsSignin')
        throw new Error('Tài khoản hoặc mật khẩu không chính xác');
      if (res?.error === 'AccessDenied') throw new Error('Từ chối đăng nhập');

      router.back();
      router.refresh();

      return successToast();
    } catch (error) {
      if (error instanceof Error) {
        return toast({
          title: error.message,
          description: 'Vui lòng thử lại sau',
          variant: 'destructive',
        });
      }

      return serverErrorToast();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <FormField
          control={form.control}
          name="totp"
          render={({ field }) => (
            <FormItem>
              <PinInput
                length={6}
                type={'number'}
                oneTimeCode
                aria-label="one time code"
                styles={{
                  root: {
                    '&': {
                      justifyContent: 'center',
                    },
                  },
                }}
                {...field}
              />
            </FormItem>
          )}
        />

        <Button
          isLoading={isLoading}
          disabled={isLoading}
          type="submit"
          className="w-full"
        >
          Xác nhận
        </Button>
      </form>
    </Form>
  );
};

export default TwoFactorForm;
