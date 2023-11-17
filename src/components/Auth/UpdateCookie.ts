'use server';

import { cookies } from 'next/headers';

const HOST_URL = new URL(process.env.NEXTAUTH_URL!);
const useSecureCookies = HOST_URL.protocol.startsWith('https');

export async function UpdateCookie(token: string) {
  const sessionExpiry = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 - 2000);
  cookies().set(
    `${useSecureCookies ? '__Secure-' : ''}next-auth.session-token`,
    token,
    {
      expires: sessionExpiry,
      httpOnly: true,
      sameSite: 'lax',
      domain:
        HOST_URL.hostname === 'localhost'
          ? HOST_URL.hostname
          : `.moetruyen.net`,
      secure: useSecureCookies,
    }
  );

  return;
}
