import { db } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import { textVerifyMai, transporter, verifyMail } from '@/lib/mail';
import { AuthSignUpValidator } from '@/lib/validators/auth';
import { hash } from 'bcrypt';
import { z } from 'zod';

enum ErrorEnum {
  SEND_FAIL = 'SEND_FAIL',
  VALID_FAIL = 'VALID_FAIL',
}

export async function POST(req: Request) {
  try {
    const { email, password } = AuthSignUpValidator.parse(await req.json());
    const [user, domain] = email.split('@');
    const filterredUser = user.replace(/[.+]/g, '');

    if (!domain.startsWith('gmail.com')) throw Error(ErrorEnum.VALID_FAIL);

    const mergedEmail = `${filterredUser}@${domain}`;

    const userExists = await db.user.findUnique({
      where: {
        email: mergedEmail,
      },
      select: {
        id: true,
      },
    });

    if (userExists) return new Response('Existing account', { status: 403 });

    const hashedPwd = await hash(password, 12);
    const token = signToken({ email: mergedEmail, password: hashedPwd }, '30m');

    const result = await transporter.sendMail({
      to: mergedEmail,
      from: `Moetruyen<${process.env.MAIL_USER!}>`,
      subject: 'Xác thực tài khoản',
      html: verifyMail(token),
      text: textVerifyMai(token),
    });

    const failed = result.rejected.concat(result.pending).filter(Boolean);
    if (failed.length) throw Error(ErrorEnum.SEND_FAIL);

    return new Response('An email was sent to your email', {
      status: 201,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === ErrorEnum.SEND_FAIL)
        return new Response(error.message, { status: 418 });
      if (error.message === ErrorEnum.VALID_FAIL)
        return new Response('Email validator failed', { status: 406 });
    }

    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
