import bcrypt from 'bcrypt';
import { AuthOptions, getServerSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from './db';
import { AuthSignInValidator } from './validators/auth';
import {
  uniqueNamesGenerator,
  NumberDictionary,
  type Config,
} from 'unique-names-generator';

const CatNames = [
  'MoeMongMo',
  'MoeBietTuot',
  'MoeDiHia',
  'MoeBayBong',
  'MoeBienThai',
  'MoeTangDong',
  'MoeHipHop',
  'MoeLuoiNhat',
  'MoeNhayNhot',
  'MoeFlexing',
  'MoePressing',
  'MoeMoeMoe',
  'MoeSimpMy',
  'MoeNguoc',
  'BLVAnhMoe',
  'MoeItalia',
  'MoeVOZER',
  'MoeThoNgoc',
  'MoeHutCan',
  'MoeTeNan',
  'MoeNghien',
  'MeoPayLak',
  'MoeVuiVe',
  'MoeNgocNghech',
];

const numberDictionary = NumberDictionary.generate({ min: 1, max: 9999 });

const customConfig: Config = {
  dictionaries: [CatNames, numberDictionary],
  separator: '',
  length: 2,
};

export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        try {
          const { email, password } = AuthSignInValidator.parse(credentials);

          const userExists = await db.user.findFirst({
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
            },
          });

          if (!userExists) return null;

          const { password: userPwd, ...userWithoutPass } = userExists;

          if (!(await bcrypt.compare(password, userPwd))) return null;

          return {
            id: userWithoutPass.id,
            name: userWithoutPass.name,
            image: userWithoutPass.image,
            banner: userWithoutPass.banner,
            color: userWithoutPass.color as
              | {
                  from: string;
                  to: string;
                }
              | { color: string }
              | null,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.banner = token.banner;
        session.user.color = token.color;
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        if (!user.name) {
          user = await db.user
            .update({
              where: {
                id: user.id,
              },
              data: {
                name: uniqueNamesGenerator(customConfig),
              },
              select: {
                id: true,
                name: true,
                image: true,
                banner: true,
                color: true,
              },
            })
            .then((res) => ({
              id: res.id,
              name: res.name,
              image: res.image,
              banner: res.banner,
              color: res.color as
                | {
                    from: string;
                    to: string;
                  }
                | { color: string }
                | null,
            }));
        }

        return {
          id: user.id,
          name: user.name,
          picture: user.image,
          banner: user.banner,
          color: user.color,
        };
      } else {
        const dbUser = await db.user.findUnique({
          where: {
            id: token.id,
          },
          select: {
            id: true,
            name: true,
            image: true,
            banner: true,
            color: true,
          },
        });

        if (dbUser)
          return {
            id: dbUser.id,
            name: dbUser.name,
            picture: dbUser.image,
            banner: dbUser.banner,
            color: dbUser.color as
              | {
                  from: string;
                  to: string;
                }
              | { color: string }
              | null,
          };
      }
      return token;
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
