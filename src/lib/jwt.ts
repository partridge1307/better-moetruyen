import { JsonWebTokenError, sign, verify } from 'jsonwebtoken';

export const signToken = (payload: object, expiresIn: string = '30m') =>
  sign({ ...payload }, process.env.NEXTAUTH_SECRET!, { expiresIn });

export const signPublicToken = (payload: object, expiresIn: string = '15m') =>
  sign({ ...payload }, process.env.PUBLIC_KEY!, { expiresIn });

export const verifyToken = (token: string) => {
  try {
    const decoded = verify(token, process.env.NEXTAUTH_SECRET!);

    return decoded;
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return 'Expired token';
    }
    return null;
  }
};
