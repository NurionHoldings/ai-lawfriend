import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const schemaFile = path.join(root, "prisma", "schema.prisma");
const repositoryFile = path.join(
  root,
  "src",
  "features",
  "supplement-request",
  "supplement-request.repository.ts"
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  assert(fs.existsSync(schemaFile), "prisma/schema.prisma 파일이 없습니다.");
  assert(fs.existsSync(repositoryFile), "supplement-request.repository.ts 파일이 없습니다.");

  const schema = fs.readFileSync(schemaFile, "utf8");
  const repository = fs.readFileSync(repositoryFile, "utf8");

  const requiredSchemaTexts = [
    "enum SupplementRequestStatus",
    "enum SupplementRequestType",
    "enum SupplementAttachmentRole",
    "enum SupplementRequestAuditActionType",
    "model SupplementRequest",
    "model SupplementRequestItem",
    "model SupplementResponse",
    "model SupplementResponseAttachment",
    "model SupplementRequestStatusLog",
    "model SupplementRequestAuditLog",
    "DRAFT",
    "CLIENT_RESPONDED",
    "NEEDS_MORE_INFO",
    "CaseAttachment",
  ];

  const requiredRepositoryTexts = [
    "createSupplementRequestRepository",
    "updateSupplementRequestRepository",
    "findSupplementRequestByIdRepository",
    "listSupplementRequestsRepository",
    "createSupplementResponseRepository",
    "appendSupplementRequestStatusLogRepository",
    "appendSupplementRequestAuditLogRepository",
    "withSupplementRequestTransaction",
  ];

  for (const text of requiredSchemaTexts) {
    assert(schema.includes(text), `schema.prisma에 필수 문구가 없습니다: ${text}`);
  }

  for (const text of requiredRepositoryTexts) {
    assert(repository.includes(text), `repository 파일에 필수 문구가 없습니다: ${text}`);
  }

  console.log("✅ AI법친 7.1-B supplement phase1 code draft verification PASS");
}

try {
  main();
} catch (error) {
  console.error("❌ AI법친 7.1-B supplement phase1 code draft verification FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
