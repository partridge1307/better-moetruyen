'use client';

import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

const queryClient = new QueryClient();

const Providers = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session} refetchOnWindowFocus={false}>
        <MantineProvider>{children}</MantineProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default Providers;
