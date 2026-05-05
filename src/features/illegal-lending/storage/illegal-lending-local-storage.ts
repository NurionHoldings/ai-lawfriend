import fs from "node:fs/promises";
import path from "node:path";
import type {
  GetIllegalLendingObjectResult,
  IllegalLendingStorageAdapter,
  SaveIllegalLendingObjectInput,
  SaveIllegalLendingObjectResult,
} from "./illegal-lending-storage.types";

const LOCAL_ROOT =
  process.env.ILLEGAL_LENDING_UPLOAD_ROOT ||
  path.join(process.cwd(), ".private-uploads", "illegal-lending");

function safeJoin(root: string, key: string) {
  const resolved = path.resolve(root, key);
  const normalizedRoot = path.resolve(root);

  if (!resolved.startsWith(normalizedRoot)) {
    throw new Error("허용되지 않는 파일 경로입니다.");
  }

  return resolved;
}

export const illegalLendingLocalStorage: IllegalLendingStorageAdapter = {
  async save(
    input: SaveIllegalLendingObjectInput,
  ): Promise<SaveIllegalLendingObjectResult> {
    const storagePath = safeJoin(LOCAL_ROOT, input.key);
    await fs.mkdir(path.dirname(storagePath), { recursive: true });
    await fs.writeFile(storagePath, input.body);

    return {
      provider: "local",
      key: input.key,
      storagePath,
    };
  },

  async get(key: string): Promise<GetIllegalLendingObjectResult> {
    const storagePath = safeJoin(LOCAL_ROOT, key);
    const body = await fs.readFile(storagePath);

    return {
      body,
    };
  },

  async delete(key: string) {
    const storagePath = safeJoin(LOCAL_ROOT, key);
    await fs.rm(storagePath, { force: true });
  },
};