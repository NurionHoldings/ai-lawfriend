import type {
  IllegalLendingStorageAdapter,
  IllegalLendingStorageDriver,
} from "./illegal-lending-storage.types";
import { illegalLendingLocalStorage } from "./illegal-lending-local-storage";
import { illegalLendingS3Storage } from "./illegal-lending-s3-storage";
import { illegalLendingSupabaseStorage } from "./illegal-lending-supabase-storage";

export function getIllegalLendingStorageDriver(): IllegalLendingStorageDriver {
  const driver = process.env.ILLEGAL_LENDING_STORAGE_DRIVER;

  if (driver === "s3" || driver === "r2" || driver === "supabase") {
    return driver;
  }

  return "local";
}

export function getIllegalLendingStorage(): IllegalLendingStorageAdapter {
  const driver = getIllegalLendingStorageDriver();

  if (driver === "s3" || driver === "r2") {
    return illegalLendingS3Storage;
  }

  if (driver === "supabase") {
    return illegalLendingSupabaseStorage;
  }

  return illegalLendingLocalStorage;
}