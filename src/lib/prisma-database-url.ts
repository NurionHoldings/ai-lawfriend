export type PrismaDatabaseUrlSource = "NETLIFY_DB_URL" | "DATABASE_URL";

export type PrismaDatabaseUrlResolution = {
  url: string;
  source: PrismaDatabaseUrlSource;
};

type ResolvePrismaDatabaseUrlOptions = {
  netlifyDbUrl?: string;
  databaseUrl?: string;
};

function assertPostgresUrl(value: string, label: string): string {
  const normalized = value.trim();
  if (!/^postgres(?:ql)?:\/\//.test(normalized)) {
    throw new Error(`${label} must be a PostgreSQL connection URL`);
  }
  return normalized;
}

/**
 * Netlify injects a deploy-context-specific NETLIFY_DB_URL at runtime. Always
 * prefer that official binding when it exists; local development and CI
 * continue to use DATABASE_URL. Netlify-only operational entrypoints obtain
 * the value via @netlify/database before passing it here.
 */
export function resolvePrismaDatabaseUrl(
  options: ResolvePrismaDatabaseUrlOptions = {},
): PrismaDatabaseUrlResolution {
  const netlifyDbUrl =
    options.netlifyDbUrl === undefined
      ? process.env.NETLIFY_DB_URL
      : options.netlifyDbUrl;

  if (netlifyDbUrl?.trim()) {
    return {
      url: assertPostgresUrl(netlifyDbUrl, "NETLIFY_DB_URL"),
      source: "NETLIFY_DB_URL",
    };
  }

  const databaseUrl =
    options.databaseUrl === undefined
      ? process.env.DATABASE_URL
      : options.databaseUrl;
  if (databaseUrl?.trim()) {
    return {
      url: assertPostgresUrl(databaseUrl, "DATABASE_URL"),
      source: "DATABASE_URL",
    };
  }

  throw new Error("NETLIFY_DB_URL or DATABASE_URL is required");
}
