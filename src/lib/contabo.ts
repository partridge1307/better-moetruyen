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
    if (retry && retry > 0) {
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

const generateName = (
  currentName: string,
  existingImages: string[],
  start: number,
  templateString: string
): string => {
  let newName: string, num;

  if (isNaN(start)) {
    num = 1;
    newName = `${currentName}_${num}`;
  } else {
    num = start;
    newName = `${currentName}_${num}`;
  }

  const existImage = existingImages.some((img) =>
    img.startsWith(`${templateString}/${newName}.webp`)
  );

  if (existImage) {
    return generateName(currentName, existingImages, num + 1, templateString);
  } else {
    return newName;
  }
};

export const UploadChapterImage = async (
  images: Blob[],
  mangaId: number,
  chapterIndex: number
) => {
  const optimizedImages = await Promise.all(
    images.map(async (img) => {
      const arrayBuffer = await new Blob([img]).arrayBuffer();
      const sharpImage = sharp(arrayBuffer)
        .toFormat('webp')
        .webp({ quality: 40 });

      const { width: originalWidth, height: originalHeight } =
        await sharpImage.metadata();

      const buffer = await resizeImage(
        sharpImage,
        originalWidth,
        originalHeight
      ).toBuffer();

      return {
        buffer,
        name: img.name.split('.').shift(),
      };
    })
  );

  let imagesLink: string[] = [];
  for (const image of optimizedImages) {
    const command = new PutObjectCommand({
      Body: image.buffer,
      Bucket: `chapter`,
      Key: `${mangaId}/${chapterIndex}/${image.name}.webp`,
    });

    await sendCommand(contabo, command, 5);

    imagesLink.push(
      `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterIndex}/${image.name}.webp`
    );
  }

  return imagesLink;
};

export const UploadMangaImage = async (
  image: Blob,
  mangaId: number,
  prevImage: string | null
) => {
  const arrayBuffer = await new Blob([image]).arrayBuffer();
  const sharpImage = sharp(arrayBuffer)
    .toFormat('jpeg')
    .jpeg({ quality: 40, chromaSubsampling: '4:4:4', force: true });

  const { width, height } = await sharpImage.metadata();

  const optimizedImage = await resizeImage(
    sharpImage,
    width,
    height
  ).toBuffer();

  const command = new PutObjectCommand({
    Body: optimizedImage,
    Bucket: 'manga',
    Key: `${mangaId}/thumbnail.jpg`,
  });

  await sendCommand(contabo, command, 5);

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/manga/${mangaId}/thumbnail.jpg`,
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
  newImages: (Blob | string)[],
  existingImages: string[],
  mangaId: number,
  chapterIndex: number
) => {
  const [serializedNewImages, serializedExistImages] = await Promise.all([
    newImages.map((image, index) => ({ index, image })),
    existingImages.map((image, index) => ({ index, image })),
  ]);
  const [blobImages, linkImages] = await Promise.all([
    serializedNewImages.filter((image) => image.image instanceof File) as {
      index: number;
      image: File;
    }[],
    serializedNewImages.filter((image) => typeof image.image === 'string') as {
      index: number;
      image: string;
    }[],
  ]);

  const blobImagesHandler = await Promise.all(
    blobImages.map(async (img) => {
      const arrayBuffer = await new Blob([img.image]).arrayBuffer();
      const sharpImage = sharp(arrayBuffer)
        .toFormat('webp')
        .webp({ quality: 40 });

      const { width, height } = await sharpImage.metadata();

      const optimizedImage = await resizeImage(
        sharpImage,
        width,
        height
      ).toBuffer();

      const key = `${
        process.env.IMG_DOMAIN
      }/chapter/${mangaId}/${chapterIndex}/${img.image.name
        .split('.')
        .shift()}.webp`;

      let command, generatedKey;

      const existImage = serializedExistImages.find(
        (exist) => exist.index === img.index && exist.image.startsWith(key)
      );
      if (existImage) {
        command = new PutObjectCommand({
          Body: optimizedImage,
          Bucket: 'chapter',
          Key: `${mangaId}/${chapterIndex}/${img.image.name
            .split('.')
            .shift()}.webp`,
        });

        generatedKey = generateKey(
          `${
            process.env.IMG_DOMAIN
          }/chapter/${mangaId}/${chapterIndex}/${img.image.name
            .split('.')
            .shift()}.webp`,
          existImage.image
        );
      } else {
        const name = img.image.name.split('.')[0].split('_');
        const newName = generateName(
          name[0],
          existingImages,
          Number(name[1]),
          `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterIndex}`
        );

        command = new PutObjectCommand({
          Body: optimizedImage,
          Bucket: 'chapter',
          Key: `${mangaId}/${chapterIndex}/${newName}.webp`,
        });

        generatedKey = generateKey(
          `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterIndex}/${newName}.webp`,
          null
        );
      }

      return {
        index: img.index,
        image: generatedKey,
        command: command,
      };
    })
  );

  let uploadedNewImages: { index: number; image: string }[] = [];
  for (const blobImage of blobImagesHandler) {
    await sendCommand(contabo, blobImage.command, 5);

    uploadedNewImages.push({ index: blobImage.index, image: blobImage.image });
  }

  const deletedImages = serializedExistImages.filter(
    (img) => !linkImages.some((image) => image.image === img.image)
  );
  for (const deletedImage of deletedImages) {
    const image = new URL(deletedImage.image).pathname.split('/').pop();

    const command = new DeleteObjectCommand({
      Bucket: 'chapter',
      Key: `${mangaId}/${chapterIndex}/${image}`,
    });

    await sendCommand(contabo, command, 5);
  }

  return [...linkImages, ...uploadedNewImages];
};

export const UploadBadgeImage = async (
  image: File,
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
    Bucket: 'badge',
    Key: `${image.name}.webp`,
  });

  await sendCommand(contabo, command, 5);

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/badge/${image.name}.webp`,
    prevImage
  );

  return Key;
};
