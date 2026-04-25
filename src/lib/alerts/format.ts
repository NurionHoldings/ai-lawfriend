export function formatDateTime(value?: string | Date | null) {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString();
}

export function formatUserLabel(
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null
) {
  if (!user) return "-";
  if (user.name && user.email) return `${user.name} (${user.email})`;
  return user.name || user.email || "-";
}
