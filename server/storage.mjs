// Bucket de Railway (S3-compatible) para los soportes de cada obligación.
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let s3 = null;

function client() {
  if (!s3) {
    s3 = new S3Client({
      region: process.env.BUCKET_REGION || "auto",
      endpoint: process.env.BUCKET_ENDPOINT,
      credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY_ID,
        secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3;
}

function bucketName() {
  const nombre = process.env.BUCKET_NAME;
  if (!nombre) throw new Error("BUCKET_NAME no está configurada.");
  return nombre;
}

export async function subirArchivo(key, buffer, contentType) {
  await client().send(
    new PutObjectCommand({ Bucket: bucketName(), Key: key, Body: buffer, ContentType: contentType })
  );
}

export async function urlDescarga(key, nombreArchivo) {
  return getSignedUrl(
    client(),
    new GetObjectCommand({
      Bucket: bucketName(),
      Key: key,
      ResponseContentDisposition: `attachment; filename="${nombreArchivo.replace(/"/g, "")}"`,
    }),
    { expiresIn: 300 } // 5 minutos — de sobra para que el navegador dispare la descarga
  );
}

export async function borrarArchivo(key) {
  await client().send(new DeleteObjectCommand({ Bucket: bucketName(), Key: key }));
}
