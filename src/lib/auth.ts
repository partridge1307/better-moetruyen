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
          });

          if (!userExists) return null;

          const { password: userPwd, ...userWithoutPass } = userExists;

          if (!(await bcrypt.compare(password, userPwd))) return null;

          return {
            id: userWithoutPass.id,
            name: userWithoutPass.name,
            image: userWithoutPass.image,
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
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        if (!user.name)
          user = await db.user.update({
            where: {
              id: user.id,
            },
            data: {
              name: uniqueNamesGenerator(customConfig),
            },
          });

        return {
          id: user.id,
          name: user.name,
          picture: user.image,
        };
      }
      return token;
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
