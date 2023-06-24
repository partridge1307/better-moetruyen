import { db } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import { Mail } from '@/lib/mail';
import { verifyHTML } from '@/lib/utils';
import { AuthSignUpValidator } from '@/lib/validators/auth';
import { hash } from 'bcrypt';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = AuthSignUpValidator.parse(body);

    const userExists = await db.user.findFirst({
      where: {
        email,
      },
    });

    if (userExists)
      return new Response('Tài khoản đã tồn tại', { status: 401 });

    const hashedPwd = await hash(password, 10);
    const token = signToken({ email, password: hashedPwd }, '30m');
    await Mail({
      email,
      subject: 'Xác thực tài khoản',
      html: verifyHTML(token),
    });

    return new Response('Đã gửi thư xác nhận đến mail', {
      status: 201,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response('Có lỗi xảy ra', { status: 500 });
  }
}
