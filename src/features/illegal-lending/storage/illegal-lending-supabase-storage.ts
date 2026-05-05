import { createClient } from "@supabase/supabase-js";
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

function getSupabase() {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      persistSession: false,
    },
  });
}

const bucket = () => process.env.ILLEGAL_LENDING_SUPABASE_BUCKET || "illegal-lending-private";

export const illegalLendingSupabaseStorage: IllegalLendingStorageAdapter = {
  async save(
    input: SaveIllegalLendingObjectInput,
  ): Promise<SaveIllegalLendingObjectResult> {
    const supabase = getSupabase();

    const { error } = await supabase.storage.from(bucket()).upload(input.key, input.body, {
      contentType: input.contentType,
      upsert: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      provider: "supabase",
      key: input.key,
      storagePath: `${bucket()}/${input.key}`,
    };
  },

  async get(key: string): Promise<GetIllegalLendingObjectResult> {
    const supabase = getSupabase();

    const { data, error } = await supabase.storage.from(bucket()).download(key);

    if (error) {
      throw new Error(error.message);
    }

    const arrayBuffer = await data.arrayBuffer();

    return {
      body: Buffer.from(arrayBuffer),
      contentType: data.type,
    };
  },

  async delete(key: string) {
    const supabase = getSupabase();

    const { error } = await supabase.storage.from(bucket()).remove([key]);

    if (error) {
      throw new Error(error.message);
    }
  },
};