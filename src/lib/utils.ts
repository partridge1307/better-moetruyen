import { twMerge } from 'tailwind-merge';
import { ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const verifyHTML = (token: string) => `<!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title></title>
      </head>
      <body
        style="
          text-align: center;
          margin: 0;
          padding: 10px;
          background-color: #3f3f46;
          color: white;
          height: 70vh;
        "
      >
          <div style="font-size: 2rem">
            <h1 style="color: #506de4; margin-bottom: 0.7rem">Moetruyen</h1>
            <p style="margin-top: 0px">Cảm ơn bạn đã tạo tài khoản</p>
          </div>
          <div style="margin-top: 4rem; font-size: 1.2rem">
            <p style="margin-bottom: 5rem">
              Nhấn vào nút bên dưới để xác thực tài khoản. Có hiệu lực trong 30 phút
            </p>
            <a
              href="${process.env.NEXTAUTH_URL}/verify/${token}"
              style="
                text-decoration: none;
                color: white;
                background-color: #506de4;
                padding: 1rem;
                border-radius: 0.7rem;
              "
              >Nhấn tôi đi</a
            >
          </div>
      </body>
    </html>`;

export const groupBy = <T>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => string
) =>
  array.reduce((acc, value, index, array) => {
    (acc[predicate(value, index, array)] ||= []).push(value);
    return acc;
  }, {} as { [key: string]: T[] });
