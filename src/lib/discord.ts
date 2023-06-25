import axios from 'axios';

// export const useDiscord = (blobImage: string | File) => {
//   const upload = async () => {
//     // const headers = new Headers();
//     const form = new FormData();
//     form.append('file', blobImage);

//     const { data } = await axios.post(process.env.DISCORD_WH_TOKEN!, form);

//     return data as string;
//   };

//   return { upload };
// };

export const upload = async (blobImage: any) => {
  const form = new FormData();
  form.append('file', blobImage, 'image.webp');

  const { data } = await axios.post(process.env.DISCORD_WH_TOKEN!, form);

  return data.attachments[0].url as string;
};
