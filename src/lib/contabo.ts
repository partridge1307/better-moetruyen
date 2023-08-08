import {
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { sleep } from './utils';

const contabo = new S3Client({
  endpoint: process.env.CB_URL_ENDPOINT!,
  region: process.env.CB_REGION!,
  credentials: {
    accessKeyId: process.env.CB_ACCESS_KEY!,
    secretAccessKey: process.env.CB_SECRET_KEY!,
  },
  forcePathStyle: true,
  maxAttempts: 5,
});

const sendCommand = async (
  client: S3Client,
  command: PutObjectCommand,
  retry = 5
): Promise<PutObjectCommandOutput> => {
  try {
    return await client.send(command);
  } catch (error) {
    if (retry || retry > 0) {
      retry--;
      await sleep(1.5);
      return await sendCommand(client, command, retry);
    } else throw error;
  }
};

const resizeImage = (
  image: sharp.Sharp,
  originalWidth?: number,
  originalHeight?: number
) => {
  let optimizedImage;
  if (originalWidth && originalHeight) {
    if (originalWidth < originalHeight) {
      originalWidth > 1100
        ? (optimizedImage = image.resize(1100))
        : (optimizedImage = image);
    } else {
      originalWidth > 1600
        ? (optimizedImage = image.resize(1600))
        : (optimizedImage = image);
    }
  } else {
    optimizedImage = image;
  }

  return optimizedImage;
};

export const UploadChapterImage = (
  images: Blob[],
  mangaId: number,
  chapterIndex: number
) =>
  Promise.all(
    images.map(async (image, index) => {
      const arrayBuffer = await new Blob([image]).arrayBuffer();
      const sharpImage = sharp(arrayBuffer)
        .toFormat('webp')
        .webp({ quality: 40 });

      const { width: originalWidth, height: originalHeight } =
        await sharpImage.metadata();

      const optimizedImage = await resizeImage(
        sharpImage,
        originalWidth,
        originalHeight
      ).toBuffer();

      const command = new PutObjectCommand({
        Body: optimizedImage,
        Bucket: `chapter`,
        Key: `${mangaId}/${chapterIndex}/${index + 1}.webp`,
      });

      await sendCommand(contabo, command, 5);

      return `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterIndex}/${
        index + 1
      }.webp`;
    })
  );

export const UploadMangaImage = async (image: Blob, mangaId: number) => {
  const arrayBuffer = await new Blob([image]).arrayBuffer();
  const sharpImage = sharp(arrayBuffer).toFormat('webp').webp({ quality: 40 });

  const { width, height } = await sharpImage.metadata();

  const optimizedImage = await resizeImage(
    sharpImage,
    width,
    height
  ).toBuffer();

  const command = new PutObjectCommand({
    Body: optimizedImage,
    Bucket: 'manga',
    Key: `${mangaId}/thumbnail.webp`,
  });

  await sendCommand(contabo, command, 5);

  return `${process.env.IMG_DOMAIN}/manga/${mangaId}/thumbnail.webp`;
};

export const UploadUserImage = async (
  image: Blob,
  userId: string,
  type: 'banner' | 'avatar'
) => {
  const arrayBuffer = await new Blob([image]).arrayBuffer();
  const sharpImage = sharp(arrayBuffer).toFormat('webp').webp({ quality: 40 });

  const { width, height } = await sharpImage.metadata();

  const optimizedImage = await resizeImage(
    sharpImage,
    width,
    height
  ).toBuffer();

  const command = new PutObjectCommand({
    Body: optimizedImage,
    Bucket: 'user',
    Key: `${type}/${userId}.webp`,
  });

  await sendCommand(contabo, command, 5);

  return `${process.env.IMG_DOMAIN}/user/${type}/${userId}.webp`;
};

export const UploadTeamImage = async (image: Blob, teamId: number) => {
  const arrayBuffer = await new Blob([image]).arrayBuffer();
  const sharpImage = sharp(arrayBuffer).toFormat('webp').webp({ quality: 40 });

  const { width, height } = await sharpImage.metadata();

  const optimizedImage = await resizeImage(
    sharpImage,
    width,
    height
  ).toBuffer();

  const command = new PutObjectCommand({
    Body: optimizedImage,
    Bucket: 'team',
    Key: `${teamId}.webp`,
  });

  await sendCommand(contabo, command, 5);

  return `${process.env.IMG_DOMAIN}/team/${teamId}.webp`;
};
