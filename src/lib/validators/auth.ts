import { z } from "zod";

/** [FILE-006·007] 공개 auth body — [§5·Batch C] `transition`/인터뷰 API와 동일한 `.strict()` 취지(확장 필드 거부) */
export const signUpSchema = z
  .object({
    email: z.string().trim().email("올바른 이메일 형식이 아닙니다."),
    password: z
      .string()
      .min(8, "비밀번호는 8자 이상이어야 합니다.")
      .max(100, "비밀번호가 너무 깁니다."),
    name: z
      .string()
      .trim()
      .min(2, "이름은 2자 이상이어야 합니다.")
      .max(50, "이름이 너무 깁니다."),
    phone: z
      .union([
        z.literal(""),
        z
          .string()
          .trim()
          .min(9, "전화번호 형식이 올바르지 않습니다.")
          .max(20, "전화번호 형식이 올바르지 않습니다."),
      ])
      .optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().min(1, "이메일 또는 데모 로그인 ID를 입력해 주세요."),
    password: z.string().min(1, "비밀번호를 입력해 주세요."),
  })
  .strict();
