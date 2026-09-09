import { describe, expect, it } from "vitest";
import { resolvePrismaDatabaseUrl } from "./prisma-database-url";

describe("resolvePrismaDatabaseUrl", () => {
  it("prefers the official Netlify Database runtime binding", () => {
    expect(
      resolvePrismaDatabaseUrl({
        netlifyDbUrl: "postgresql://runtime-writer@example.test/app",
        databaseUrl: "postgresql://local-fallback@example.test/app",
      }),
    ).toEqual({
      url: "postgresql://runtime-writer@example.test/app",
      source: "NETLIFY_DB_URL",
    });
  });

  it("uses DATABASE_URL when no Netlify runtime binding exists", () => {
    expect(
      resolvePrismaDatabaseUrl({
        netlifyDbUrl: "",
        databaseUrl: " postgres://ci@example.test/app ",
      }),
    ).toEqual({
      url: "postgres://ci@example.test/app",
      source: "DATABASE_URL",
    });
  });

  it("fails closed for missing or malformed database URLs", () => {
    expect(() =>
      resolvePrismaDatabaseUrl({ netlifyDbUrl: "", databaseUrl: "" }),
    ).toThrow(/required/);
    expect(() =>
      resolvePrismaDatabaseUrl({
        netlifyDbUrl: "not-postgres",
        databaseUrl: "postgresql://fallback",
      }),
    ).toThrow(/NETLIFY_DB_URL/);
  });
});
