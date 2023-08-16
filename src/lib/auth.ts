import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { AuthOptions, getServerSession } from 'next-auth';
import { decode, encode } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import Email from 'next-auth/providers/email';
import { cookies, headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { db } from './db';
import { signInMail, textSignInMail, transporter } from './mail';
import { generateRandomName } from './uniqueName';
import { AuthSignInValidator } from './validators/auth';

export interface AuthContext {
  params: { nextauth: string[] };
}

export const authOptionsWrapper = (
  request: NextRequest,
  context: AuthContext
) => {
  const { params } = context;

  const isCredentialsCallback =
    params?.nextauth?.includes('callback') &&
    params.nextauth.includes('credentials') &&
    request.method === 'POST';

  return [
    request,
    context,
    {
      adapter: PrismaAdapter(db),
      pages: {
        signIn: '/sign-in',
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

              const userExists = await db.user.findFirstOrThrow({
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
                },
              });

              if (await bcrypt.compare(password, userExists.password)) {
                return {
                  id: userExists.id,
                  name: userExists.name,
                  image: userExists.image,
                  banner: userExists.banner,
                  color: userExists.color as
                    | { color: string }
                    | { from: string; to: string }
                    | null,
                  muteExpires: userExists.muteExpires,
                  isBanned: userExists.isBanned,
                };
              } else throw Error();
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
      callbacks: {
        async signIn({ user }) {
          try {
            if (user) {
              if (isCredentialsCallback) {
                const sessionToken = randomUUID();
                const sessionExpiry = new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                );

                await db.session.create({
                  data: {
                    sessionToken,
                    userId: user.id,
                    expires: sessionExpiry,
                  },
                });

                cookies().set('next-auth.session-token', sessionToken, {
                  expires: sessionExpiry,
                });
              } else {
                await db.user.findUniqueOrThrow({
                  where: {
                    id: user.id,
                  },
                });
              }

              return true;
            } else throw new Error();
          } catch (error) {
            return `/sign-up`;
          }
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
            const updatedUser = await db.user.update({
              where: {
                id: dbUser.id,
              },
              data: {
                name: generateRandomName,
              },
            });

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
        maxAge: 30 * 24 * 60 * 60,
        encode: async (arg) => {
          if (isCredentialsCallback) {
            const cookie = cookies().get('next-auth.session-token');

            if (cookie) return cookie.value;
            return '';
          }

          return encode(arg);
        },
        decode: async (arg) => {
          if (isCredentialsCallback) {
            return null;
          }
          return decode(arg);
        },
      },
      // events: {
      //   async signOut({ session }) {
      //     const { sessionToken = '', userId } = session as unknown as {
      //       sessionToken?: string;
      //       userId: string;
      //     };

      //     console.log(session, sessionToken);

      //     if (sessionToken.length) {
      //     }
      //   },
      // },
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

// export const authOptions: AuthOptions = {
//   adapter: PrismaAdapter(db),
//   pages: {
//     signIn: '/sign-in',
//   },
//   session: {
//     strategy: 'database',
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   providers: [
//     Credentials({
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' },
//       },

//       async authorize(credentials) {
//         try {
//           const { email, password } = AuthSignInValidator.parse(credentials);

//           const userExists = await db.user.findFirst({
//             where: {
//               email,
//             },
//             select: {
//               id: true,
//               name: true,
//               image: true,
//               banner: true,
//               color: true,
//               password: true,
//             },
//           });

//           if (!userExists) return null;

//           const { password: userPwd, ...userWithoutPass } = userExists;

//           if (!(await bcrypt.compare(password, userPwd))) return null;

//           return {
//             id: userWithoutPass.id,
//             name: userWithoutPass.name,
//             image: userWithoutPass.image,
//             banner: userWithoutPass.banner,
//             color: userWithoutPass.color as
//               | {
//                   from: string;
//                   to: string;
//                 }
//               | { color: string }
//               | null,
//           };
//         } catch (error) {
//           return null;
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id;
//         session.user.name = token.name;
//         session.user.image = token.picture;
//         session.user.banner = token.banner;
//         session.user.color = token.color;
//       }

//       return session;
//     },
//     async jwt({ token, user }) {
//       if (user) {
//         if (!user.name) {
//           user = await db.user
//             .update({
//               where: {
//                 id: user.id,
//               },
//               data: {
//                 name: uniqueNamesGenerator(customConfig),
//               },
//               select: {
//                 id: true,
//                 name: true,
//                 image: true,
//                 banner: true,
//                 color: true,
//               },
//             })
//             .then((res) => ({
//               id: res.id,
//               name: res.name,
//               image: res.image,
//               banner: res.banner,
//               color: res.color as
//                 | {
//                     from: string;
//                     to: string;
//                   }
//                 | { color: string }
//                 | null,
//             }));
//         }

//         return {
//           id: user.id,
//           name: user.name,
//           picture: user.image,
//           banner: user.banner,
//           color: user.color,
//         };
//       } else {
//         const dbUser = await db.user.findUnique({
//           where: {
//             id: token.id,
//           },
//           select: {
//             id: true,
//             name: true,
//             image: true,
//             banner: true,
//             color: true,
//           },
//         });

//         if (dbUser)
//           return {
//             id: dbUser.id,
//             name: dbUser.name,
//             picture: dbUser.image,
//             banner: dbUser.banner,
//             color: dbUser.color as
//               | {
//                   from: string;
//                   to: string;
//                 }
//               | { color: string }
//               | null,
//           };
//       }
//       return token;
//     },
//   },
// };

// export const getAuthSession = () => getServerSession(authOptions);
