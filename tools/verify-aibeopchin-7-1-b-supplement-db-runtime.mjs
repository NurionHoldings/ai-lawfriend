import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function tableExists(tableName) {
  const rows = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    ) AS "exists";
  `;

  return Boolean(rows?.[0]?.exists);
}

async function enumExists(enumName) {
  const rows = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM pg_type
      WHERE typname = ${enumName}
    ) AS "exists";
  `;

  return Boolean(rows?.[0]?.exists);
}

async function main() {
  console.log("AI법친 7.1-B supplement DB runtime verification start");

  const requiredEnums = [
    "SupplementRequestStatus",
    "SupplementRequestType",
    "SupplementAttachmentRole",
    "SupplementRequestAuditActionType",
  ];

  const requiredTables = [
    "SupplementRequest",
    "SupplementRequestItem",
    "SupplementResponse",
    "SupplementResponseAttachment",
    "SupplementRequestStatusLog",
    "SupplementRequestAuditLog",
  ];

  for (const enumName of requiredEnums) {
    const exists = await enumExists(enumName);
    assert(exists, `Missing enum: ${enumName}`);
    console.log(`enum OK: ${enumName}`);
  }

  for (const tableName of requiredTables) {
    const exists = await tableExists(tableName);
    assert(exists, `Missing table: ${tableName}`);
    console.log(`table OK: ${tableName}`);
  }

  const migrationRows = await prisma.$queryRaw`
    SELECT migration_name, finished_at
    FROM _prisma_migrations
    WHERE migration_name ILIKE '%supplement%'
    ORDER BY finished_at DESC
    LIMIT 5;
  `;

  assert(
    Array.isArray(migrationRows) && migrationRows.length > 0,
    "Supplement migration record not found in _prisma_migrations"
  );

  console.log("migration record OK:");
  for (const row of migrationRows) {
    console.log(`- ${row.migration_name} / ${row.finished_at}`);
  }

  console.log("AI법친 7.1-B supplement DB runtime verification PASS");
}

try {
  await main();
} catch (error) {
  console.error("AI법친 7.1-B supplement DB runtime verification FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
