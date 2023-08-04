import S3 from 'aws-sdk/clients/s3';

const contabo = new S3({
  endpoint: process.env.CB_URL!,
  accessKeyId: process.env.CB_ACCESS_KEY!,
  secretAccessKey: process.env.CB_SECRET_KEY,
  s3BucketEndpoint: true,
});

export const upload = (blobImage: Blob) => {
  contabo.putObject({
    Body: blobImage,
    Bucket: 'test',
    Key: 'test',
  });
};
