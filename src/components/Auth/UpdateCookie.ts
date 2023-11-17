'use server';

import { cookies } from 'next/headers';

export function UpdateCookie(token: string) {
  const sessionExpiry = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 - 2000);

  cookies().set(
    `${
      process.env.NODE_ENV === 'production' ? '__Secure-' : ''
    }next-auth.session-token`,
    token,
    {
      expires: sessionExpiry,
      httpOnly: true,
      sameSite: 'lax',
      domain:
        process.env.NODE_ENV === 'production' ? 'moetruyen.net' : 'localhost',
      secure: process.env.NODE_ENV === 'production',
    }
  );

  return;
}
