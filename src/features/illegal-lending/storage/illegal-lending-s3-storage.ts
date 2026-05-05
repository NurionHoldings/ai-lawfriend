import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type {
  GetIllegalLendingObjectResult,
  IllegalLendingStorageAdapter,
  SaveIllegalLendingObjectInput,
  SaveIllegalLendingObjectResult,
} from "./illegal-lending-storage.types";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} 환경변수가 필요합니다.`);
  }

  return value;
}

function getDriver() {
  const raw = process.env.ILLEGAL_LENDING_STORAGE_DRIVER;

  if (raw === "r2") return "r2";
  return "s3";
}

function createClient() {
  const endpoint = process.env.ILLEGAL_LENDING_S3_ENDPOINT;
  const region = process.env.ILLEGAL_LENDING_S3_REGION || "auto";

  return new S3Client({
    region,
    endpoint: endpoint || undefined,
    forcePathStyle: process.env.ILLEGAL_LENDING_S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: requireEnv("ILLEGAL_LENDING_S3_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("ILLEGAL_LENDING_S3_SECRET_ACCESS_KEY"),
    },
  });
}

async function streamToBuffer(body: unknown): Promise<Buffer> {
  if (!body) return Buffer.alloc(0);

  if (body instanceof Uint8Array) {
    return Buffer.from(body);
  }

  const stream = body as AsyncIterable<Uint8Array>;
  const chunks: Uint8Array[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
}

const bucket = () => requireEnv("ILLEGAL_LENDING_S3_BUCKET");

export const illegalLendingS3Storage: IllegalLendingStorageAdapter = {
  async save(
    input: SaveIllegalLendingObjectInput,
  ): Promise<SaveIllegalLendingObjectResult> {
    const client = createClient();

    await client.send(
      new PutObjectCommand({
        Bucket: bucket(),
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
        ServerSideEncryption: getDriver() === "s3" ? "AES256" : undefined,
      }),
    );

    return {
      provider: getDriver(),
      key: input.key,
      storagePath: `${bucket()}/${input.key}`,
    };
  },

  async get(key: string): Promise<GetIllegalLendingObjectResult> {
    const client = createClient();

    const result = await client.send(
      new GetObjectCommand({
        Bucket: bucket(),
        Key: key,
      }),
    );

    return {
      body: await streamToBuffer(result.Body),
      contentType: result.ContentType,
    };
  },

  async delete(key: string) {
    const client = createClient();

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket(),
        Key: key,
      }),
    );
  },
};