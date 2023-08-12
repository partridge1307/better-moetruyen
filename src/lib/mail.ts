import { createTransport } from 'nodemailer';

interface MailProps {
  email: string;
  subject: string;
  html: string;
}

const transporter = createTransport({
  host: process.env.MAIL_HOST!,
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER!,
    pass: process.env.MAIL_PASS!,
  },
});

export const Mail = async ({ email, subject, html }: MailProps) => {
  const mailOpts = {
    from: 'partridgegt137@gmail.com',
    to: email,
    subject,
    html,
  };

  return await transporter.sendMail(mailOpts);
};
