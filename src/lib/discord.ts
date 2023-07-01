import axios, { AxiosError } from 'axios';
import { sleep } from './utils';

// @ts-expect-error
export const upload = async (blobImage: any) => {
  try {
    const form = new FormData();
    form.append('file', blobImage, 'image.webp');

    const { data } = await axios.post(process.env.DISCORD_WH_TOKEN!, form);

    return data.attachments[0].url as string;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 429) {
        await sleep(2);
        return await upload(blobImage);
      }
    }
    throw error;
  }
};
