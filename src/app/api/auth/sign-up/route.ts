import { db } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import { textVerifyMai, transporter, verifyMail } from '@/lib/mail';
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
      select: {
        id: true,
      },
    });

    if (userExists)
      return new Response('Tài khoản đã tồn tại', { status: 401 });

    const hashedPwd = await hash(password, 12);
    const token = signToken({ email, password: hashedPwd }, '30m');
    const result = await transporter.sendMail({
      to: email,
      from: `Moetruyen<${process.env.MAIL_USER!}>`,
      subject: 'Xác thực tài khoản',
      html: verifyMail(token),
      text: textVerifyMai(token),
    });
    const failed = result.rejected.concat(result.pending).filter(Boolean);

    if (failed.length) throw new Error('Không thể gửi Email');

    return new Response('Đã gửi thư xác nhận đến mail', {
      status: 201,
    });
  } catch (error) {
    if (error instanceof Error)
      return new Response(error.message, { status: 400 });
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response('Có lỗi xảy ra', { status: 500 });
  }
}
