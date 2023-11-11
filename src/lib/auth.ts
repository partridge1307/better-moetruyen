import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { getServerSession, type AuthOptions } from 'next-auth';
import { decode, encode } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import Email from 'next-auth/providers/email';
import { cookies, headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { authenticator } from 'otplib';
import { decrypt } from './crypto';
import { db } from './db';
import { signInMail, textSignInMail, transporter } from './mail';
import { setRandomUsername } from './uniqueName';
import { AuthSignInValidator, AuthTwoFactorValidator } from './validators/auth';

export interface AuthContext {
  params: { nextauth: string[] };
}

const HOST_URL = new URL(process.env.NEXTAUTH_URL!);
const useSecureCookies = HOST_URL.protocol.startsWith('https');

export const authOptionsWrapper = (
  request: NextRequest,
  context: AuthContext
) => {
  const { params } = context;

  const isCredentialsCallback =
    params?.nextauth?.includes('callback') &&
    params.nextauth.includes('credentials') &&
    request.method === 'POST';
  const isTwoFactorCallBack =
    params?.nextauth?.includes('callback') &&
    params.nextauth.includes('two-factor') &&
    request.method === 'POST';

  return [
    request,
    context,
    {
      adapter: PrismaAdapter(db),
      pages: {
        signIn: '/sign-in',
        error: '/auth-error',
        verifyRequest: '/verify-request',
      },
      session: { strategy: 'database' },
      secret: process.env.NEXTAUTH_SECRET,
      providers: [
        Credentials({
          name: 'Credentials',
          credentials: {
            email: { label: 'Email', type: 'email' },
            password: { label: 'Password', type: 'password' },
          },
          authorize: async (credentials) => {
            try {
              const { email, password } =
                AuthSignInValidator.parse(credentials);

              const userExists = await db.user.findUniqueOrThrow({
                where: {
                  email,
                },
                select: {
                  id: true,
                  name: true,
                  image: true,
                  banner: true,
                  color: true,
                  password: true,
                  muteExpires: true,
                  isBanned: true,
                  twoFactorEnabled: true,
                },
              });

              if (!(await bcrypt.compare(password, userExists.password)))
                return null;

              return {
                id: userExists.id,
                name: userExists.name,
                image: userExists.image,
                banner: userExists.banner,
                color: userExists.color as
                  | { color: string }
                  | { from: string; to: string }
                  | null,
                twoFactor: userExists.twoFactorEnabled,
                muteExpires: userExists.muteExpires,
                isBanned: userExists.isBanned,
              };
            } catch (error) {
              return null;
            }
          },
        }),
        Credentials({
          id: 'two-factor',
          name: 'Two Factor Auth',
          credentials: {
            email: { label: 'Email', type: 'email' },
            password: { label: 'Password', type: 'password' },
            totp: { label: 'TOTP', type: 'number' },
          },
          authorize: async (credentials) => {
            try {
              const { email, password, totp } =
                AuthTwoFactorValidator.parse(credentials);

              const userExist = await db.user.findUniqueOrThrow({
                where: {
                  email,
                },
                select: {
                  id: true,
                  name: true,
                  image: true,
                  banner: true,
                  color: true,
                  password: true,
                  muteExpires: true,
                  isBanned: true,
                  twoFactorEnabled: true,
                  twoFactorSecret: true,
                },
              });

              if (!(await bcrypt.compare(password, userExist.password)))
                return null;

              if (!userExist.twoFactorEnabled || !userExist.twoFactorSecret)
                return null;

              const secret = decrypt(userExist.twoFactorSecret);
              if (secret.length !== 52) return null;

              const isValidToken = authenticator.check(totp, secret);
              if (!isValidToken) return null;

              return {
                id: userExist.id,
                name: userExist.name,
                image: userExist.image,
                banner: userExist.banner,
                color: userExist.color as
                  | { color: string }
                  | { from: string; to: string }
                  | null,
                muteExpires: userExist.muteExpires,
                isBanned: userExist.isBanned,
                twoFactor: false,
              };
            } catch (error) {
              return null;
            }
          },
        }),
        Email({
          server: {
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            },
          },
          from: `Moetruyen<${process.env.MAIL_USER}>`,
          maxAge: 1 * 60 * 60,
          sendVerificationRequest: async ({ identifier, url, provider }) => {
            const result = await transporter.sendMail({
              to: identifier,
              from: provider.from,
              subject: 'Đăng nhập',
              html: signInMail(url),
              text: textSignInMail(url),
            });

            const failed = result.rejected
              .concat(result.pending)
              .filter(Boolean);
            if (failed.length) {
              throw new Error(`Không thể gửi Email: (${failed.join(', ')})`);
            }
          },
        }),
      ],
      cookies: {
        sessionToken: {
          name: `${useSecureCookies ? `__Secure-` : ''}next-auth.session-token`,
          options: {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            domain:
              HOST_URL.hostname === 'localhost'
                ? HOST_URL.hostname
                : `.moetruyen.net`,
            secure: useSecureCookies,
          },
        },
      },
      callbacks: {
        async signIn({ user, account }) {
          if (user.twoFactor) throw new Error('TWO_FACTOR');

          if (user) {
            if (isCredentialsCallback || isTwoFactorCallBack) {
              const sessionToken = randomUUID();
              const sessionExpiry = new Date(
                Date.now() + 15 * 24 * 60 * 60 * 1000
              );

              await db.session.create({
                data: {
                  sessionToken,
                  userId: user.id,
                  expires: sessionExpiry,
                },
              });

              cookies().set(
                `${useSecureCookies ? '__Secure-' : ''}next-auth.session-token`,
                sessionToken,
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

              return true;
            } else {
              if (account?.provider === 'email') {
                const userExist = await db.user.findUnique({
                  where: {
                    id: user.id,
                  },
                });

                if (userExist) return true;
              }

              return false;
            }
          } else return false;
        },
        session: async ({ session, user: dbUser }) => {
          const { expires } = session;

          if (dbUser.isBanned) {
            return null;
          } else if (
            dbUser.muteExpires &&
            new Date(dbUser.muteExpires).getTime() > Date.now()
          ) {
            return null;
          }

          if (!dbUser.name) {
            const updatedUser = await setRandomUsername(dbUser.id);

            return {
              user: {
                id: updatedUser.id,
                name: updatedUser.name,
                image: updatedUser.image,
                banner: updatedUser.banner,
                color: updatedUser.color,
              },
              expires,
            };
          }

          return {
            user: {
              id: dbUser.id,
              name: dbUser.name,
              image: dbUser.image,
              banner: dbUser.banner,
              color: dbUser.color,
            },
            expires,
          };
        },
      },
      jwt: {
        maxAge: 15 * 24 * 60 * 60,
        encode: async (arg) => {
          if (isCredentialsCallback || isTwoFactorCallBack) {
            const cookie = cookies().get(
              `${useSecureCookies ? '__Secure-' : ''}next-auth.session-token`
            );

            if (cookie) return cookie.value;
            return '';
          }

          return encode(arg);
        },
        decode: async (arg) => {
          if (isCredentialsCallback || isTwoFactorCallBack) {
            return null;
          }
          return decode(arg);
        },
      },
      events: {
        signOut: async ({ session }) => {
          const { sessionToken = '' } = session as unknown as {
            sessionToken?: string;
          };

          if (sessionToken) {
            await db.session.deleteMany({
              where: {
                sessionToken,
              },
            });
          }
        },
      },
    } as AuthOptions,
  ] as const;
};

export const getAuthSession = () =>
  getServerSession(
    authOptionsWrapper(
      // @ts-ignore
      { cookies: cookies(), headers: headers() },
      { params: { nextauth: ['session'] } }
    )[2]
  );

// export const getAuthSession = () =>
//   getSession({ req: { headers: Object.fromEntries(headers().entries()) } });
