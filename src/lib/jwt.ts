import { sign, verify } from 'jsonwebtoken';
import { z } from 'zod';
import { AuthVeifyValidator } from './validators/auth';

export const signToken = (payload: object, expiresIn: string = '30m') =>
  sign({ ...payload }, process.env.NEXTAUTH_SECRET!, { expiresIn });

export const verifyAuthToken = (token: string) =>
  new Promise<z.infer<typeof AuthVeifyValidator>>((resolve, reject) => {
    try {
      const decoded = verify(token, process.env.NEXTAUTH_SECRET!);

      const data = AuthVeifyValidator.parse(decoded);

      return resolve(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reject('Invalid');
      }

      return reject('JWT ERROR');
    }
  });
