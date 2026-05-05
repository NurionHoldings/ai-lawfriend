import crypto from "node:crypto";
import {
  getIllegalLendingStorage,
  getIllegalLendingStorageDriver,
} from "./storage/illegal-lending-storage";
import type { IllegalLendingPredeployCheckItem } from "./illegal-lending-predeploy-check.types";

export async function checkIllegalLendingStorageAccess(): Promise<IllegalLendingPredeployCheckItem> {
  const driver = getIllegalLendingStorageDriver();
  const storage = getIllegalLendingStorage();

  const nonce = crypto.randomBytes(8).toString("hex");
  const key = `illegal-lending/_predeploy-check/${Date.now()}-${nonce}.txt`;
  const body = Buffer.from(
    `AI법친 불법사금융 스토리지 운영 점검 ${new Date().toISOString()}`,
    "utf8",
  );

  try {
    const saved = await storage.save({
      key,
      body,
      contentType: "text/plain; charset=utf-8",
    });

    const loaded = await storage.get(saved.key);

    const same = loaded.body.toString("utf8") === body.toString("utf8");

    if (!same) {
      return {
        key: "storage-read-write",
        title: "스토리지 쓰기/읽기 검증",
        status: "FAIL",
        message: "스토리지에 저장한 점검 파일과 읽어온 내용이 일치하지 않습니다.",
        detail: {
          driver,
          savedKey: saved.key,
          provider: saved.provider,
        },
      };
    }

    if (storage.delete) {
      await storage.delete(saved.key);
    }

    return {
      key: "storage-read-write",
      title: "스토리지 쓰기/읽기/삭제 검증",
      status: "PASS",
      message: "운영 스토리지 쓰기, 읽기, 삭제 점검이 통과했습니다.",
      detail: {
        driver,
        provider: saved.provider,
        savedKey: saved.key,
        storagePath: saved.storagePath,
        deleted: Boolean(storage.delete),
      },
    };
  } catch (error) {
    return {
      key: "storage-read-write",
      title: "스토리지 쓰기/읽기/삭제 검증",
      status: "FAIL",
      message:
        error instanceof Error
          ? error.message
          : "스토리지 운영 점검 중 알 수 없는 오류가 발생했습니다.",
      detail: {
        driver,
      },
    };
  }
}