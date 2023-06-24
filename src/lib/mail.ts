import { createTransport } from 'nodemailer';

interface MailProps {
  email: string;
  subject: string;
  html: string;
}

export const Mail = async ({ email, subject, html }: MailProps) => {
  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: 'partridgegt137@gmail.com',
      pass: 'wgbqonxpkuvqbzye',
    },
  });

  const mailOpts = {
    from: 'partridgegt137@gmail.com',
    to: email,
    subject,
    html,
  };

  return await transporter.sendMail(mailOpts);
};
