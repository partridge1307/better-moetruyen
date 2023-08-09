import {
  DeleteObjectCommand,
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
  command: PutObjectCommand | DeleteObjectCommand,
  retry = 5
): Promise<PutObjectCommandOutput> => {
  try {
    return await client.send(command);
  } catch (error) {
    if (retry > 0) {
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

const generateKey = (key: string, prevImage: string | null) => {
  let Key;

  if (prevImage) {
    const idParam = new URL(prevImage).searchParams.get('id');
    if (idParam) {
      Key = `${key}?id=${Number(idParam) + 1}`;
    } else {
      Key = `${key}?id=1`;
    }
  } else {
    Key = key;
  }

  return Key;
};

export const UploadChapterImage = (
  images: { image: Blob; index: number }[],
  mangaId: number,
  chapterIndex: number
) =>
  Promise.all(
    images.map(async (img) => {
      const arrayBuffer = await new Blob([img.image]).arrayBuffer();
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
        Key: `${mangaId}/${chapterIndex}/${img.index + 1}.webp`,
      });

      await sendCommand(contabo, command, 5);

      return {
        url: `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterIndex}/${
          img.index + 1
        }.webp`,
        index: img.index,
      };
    })
  );

export const UploadMangaImage = async (
  image: Blob,
  mangaId: number,
  prevImage: string | null
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
    Bucket: 'manga',
    Key: `${mangaId}/thumbnail.webp`,
  });

  await sendCommand(contabo, command, 5);

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/manga/${mangaId}/thumbnail.webp`,
    prevImage
  );
  return Key;
};

export const UploadUserImage = async (
  image: Blob,
  prevImage: string | null,
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

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/user/${type}/${userId}.webp`,
    prevImage
  );

  return Key;
};

export const UploadTeamImage = async (
  image: Blob,
  teamId: number,
  prevImage: string | null
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
    Bucket: 'team',
    Key: `${teamId}.webp`,
  });

  await sendCommand(contabo, command, 5);

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/team/${teamId}.webp`,
    prevImage
  );

  return Key;
};

export const EditChapterImage = async (
  newImages: { image: Blob; index: number }[],
  existingImages: string[],
  mangaId: number,
  chapterIndex: number
) => {
  const uploadedImages = await Promise.all(
    newImages.map(async (img) => {
      const arrayBuffer = await new Blob([img.image]).arrayBuffer();

      let sharpImage;
      if (img.image.type === 'application/octet-stream')
        sharpImage = sharp(arrayBuffer).toFormat('webp').webp();
      else
        sharpImage = sharp(arrayBuffer).toFormat('webp').webp({ quality: 40 });

      const { width, height } = await sharpImage.metadata();

      const optimizedImage = await resizeImage(
        sharpImage,
        width,
        height
      ).toBuffer();

      const command = new PutObjectCommand({
        Body: optimizedImage,
        Bucket: 'chapter',
        Key: `${mangaId}/${chapterIndex}/${img.index + 1}.webp`,
      });

      await sendCommand(contabo, command);

      let Key;
      const existingImage = existingImages.find((image) =>
        image.startsWith(
          `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterIndex}/${
            img.index + 1
          }.webp`
        )
      );

      if (existingImage)
        Key = generateKey(
          `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterIndex}/${
            img.index + 1
          }.webp`,
          existingImage
        );
      else
        Key = generateKey(
          `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterIndex}/${
            img.index + 1
          }.webp`,
          null
        );

      return { url: Key, index: img.index };
    })
  );

  const remainImages = existingImages.slice(uploadedImages.length);
  await Promise.all(
    remainImages.map(async (image) => {
      const key = new URL(image.split('?')[0]).pathname
        .split('/')
        .slice(2)
        .join('/');
      const command = new DeleteObjectCommand({
        Bucket: 'chapter',
        Key: key,
      });

      await sendCommand(contabo, command);
    })
  );

  return uploadedImages;
};
