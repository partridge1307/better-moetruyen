import axios from 'axios';

export const upload = async (blobImage: any) => {
  const form = new FormData();
  form.append('file', blobImage, 'image.webp');

  const { data } = await axios.post(process.env.DISCORD_WH_TOKEN!, form);

  return data.attachments[0].url as string;
};
