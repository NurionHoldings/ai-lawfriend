export type IllegalLendingStorageDriver = "local" | "s3" | "r2" | "supabase";

export type SaveIllegalLendingObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

export type SaveIllegalLendingObjectResult = {
  provider: IllegalLendingStorageDriver;
  key: string;
  storagePath: string;
};

export type GetIllegalLendingObjectResult = {
  body: Buffer;
  contentType?: string;
};

export interface IllegalLendingStorageAdapter {
  save(input: SaveIllegalLendingObjectInput): Promise<SaveIllegalLendingObjectResult>;
  get(key: string): Promise<GetIllegalLendingObjectResult>;
  delete?(key: string): Promise<void>;
}