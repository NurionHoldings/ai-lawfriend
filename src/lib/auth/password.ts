import bcrypt from "bcryptjs";

const DEFAULT_SALT_ROUNDS = 12;
const MIN_SALT_ROUNDS = 4;
const MAX_SALT_ROUNDS = 20;

export function getBcryptSaltRounds(env: NodeJS.ProcessEnv = process.env) {
  return Math.min(
    MAX_SALT_ROUNDS,
    Math.max(MIN_SALT_ROUNDS, Number(env.BCRYPT_SALT_ROUNDS) || DEFAULT_SALT_ROUNDS),
  );
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, getBcryptSaltRounds());
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
