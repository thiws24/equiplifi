import * as Minio from 'minio'

interface Props {
  accessKey: string,
  secretKey: string
}

const minioClient = ({ accessKey, secretKey }: Props) => new Minio.Client({
  endPoint: 'minio.equipli.de',
  useSSL: process.env.NODE_ENV === "production",
  accessKey,
  secretKey,
})