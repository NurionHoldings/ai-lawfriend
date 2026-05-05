export function maskName(value?: string | null) {
  if (!value) return "미기재";
  const trimmed = value.trim();
  if (trimmed.length <= 1) return "*";
  if (trimmed.length === 2) return `${trimmed[0]}*`;
  return `${trimmed[0]}${"*".repeat(trimmed.length - 2)}${trimmed[trimmed.length - 1]}`;
}

export function maskPhone(value?: string | null) {
  if (!value) return "미기재";
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7) return "***";
  return digits.replace(/(\d{3})(\d+)(\d{4})/, (_match, a, middle, c) => {
    return `${a}-${"*".repeat(String(middle).length)}-${c}`;
  });
}

export function maskEmail(value?: string | null) {
  if (!value) return "미기재";
  const [local, domain] = value.split("@");
  if (!local || !domain) return "***";
  const maskedLocal =
    local.length <= 2
      ? `${local[0] ?? "*"}*`
      : `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}`;
  return `${maskedLocal}@${domain}`;
}

export function maskAccount(value?: string | null) {
  if (!value) return "미기재";
  const compact = value.replace(/\s/g, "");
  if (compact.length <= 6) return "******";
  return `${compact.slice(0, 3)}${"*".repeat(Math.max(4, compact.length - 6))}${compact.slice(-3)}`;
}