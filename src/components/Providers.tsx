'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';

const Providers = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session} refetchOnWindowFocus={false}>
        {children}
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default Providers;
