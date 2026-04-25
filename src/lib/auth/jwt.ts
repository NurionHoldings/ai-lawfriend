import { SignJWT, jwtVerify } from "jose";

/** API·middleware가 동일한 바이트 시크릿을 쓰도록 단일 진입점 (JWT_SECRET 불일치 방지) */
export function getJwtSecretKey() {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET 환경변수가 설정되지 않았습니다.");
  }
  return new TextEncoder().encode(JWT_SECRET);
}

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: string;
};

export async function signAccessToken(payload: AuthTokenPayload) {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecretKey());
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecretKey());
  return payload;
}
