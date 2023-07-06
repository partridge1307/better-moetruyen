import axios, { AxiosError } from 'axios';
import { sleep } from './utils';

export const upload = async ({
  blobImage,
  retryCount = 5,
}: {
  blobImage: any;
  retryCount?: number;
}): Promise<string> => {
  try {
    const form = new FormData();
    form.append('file', blobImage, 'image.webp');

    const { data } = await axios.post(process.env.DISCORD_WH_TOKEN!, form);

    return data.attachments[0].url as string;
  } catch (error) {
    if (retryCount) {
      retryCount--;
      await sleep(2);
      return await upload({ blobImage, retryCount });
    } else {
      if (error instanceof AxiosError) {
        if (error.response?.status === 429) {
          throw error.message;
        }
      }
      throw error;
    }
  }
};
