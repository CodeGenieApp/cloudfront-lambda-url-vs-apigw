import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getAwsClientConfig } from '@/common/aws-client-config'
import { AWS_REGION, USER_UPLOADED_FILES_BUCKET } from '../config'

const s3Client = new S3Client(getAwsClientConfig())

export async function uploadImageToS3(imageData: string, imageKey: string, extension: string) {
  const buffer = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64')
  return s3Client.send(
    new PutObjectCommand({
      Bucket: USER_UPLOADED_FILES_BUCKET,
      Key: imageKey,
      Body: buffer,
      ContentType: `image/${extension}`,
    }),
  )
}

export async function deleteImageFromS3(imageKey: string) {
  return s3Client.send(
    new DeleteObjectCommand({
      Bucket: USER_UPLOADED_FILES_BUCKET,
      Key: imageKey,
    }),
  )
}

export async function getImageUrlFromS3(imageKey: string) {
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: USER_UPLOADED_FILES_BUCKET,
      Key: imageKey,
    }),
    { expiresIn: 3600 },
  )
}

export function getBucketUrl() {
  const regionPart = AWS_REGION === 'us-east-1' ? '' : `.${AWS_REGION}`
  return `https://${USER_UPLOADED_FILES_BUCKET}.s3${regionPart}.amazonaws.com/`
}

export function getFileTypeFromBase64(base64String) {
  const match = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/)
  if (match && match[1]) {
    return match[1].split('/')[1]
  }
  return null
}
