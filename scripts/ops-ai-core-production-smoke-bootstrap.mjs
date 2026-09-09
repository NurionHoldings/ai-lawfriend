/**
 * Idempotently provisions dedicated fictional production-smoke records and syncs
 * their generated credentials to the already-linked Netlify production context.
 * It never sends messages, charges money, or deletes data.
 *
 * Run only from the linked ai-lawfriend checkout:
 *   npm run ops:ai-core-production-smoke-bootstrap -- --confirm-production
 */
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import process from "node:process";
import bcrypt from "bcryptjs";
import {
  AI_CORE_SMOKE_ACCOUNTS,
  AI_CORE_SMOKE_ANSWERS,
  AI_CORE_SMOKE_CASE_TITLE,
  AI_CORE_SMOKE_MARKER,
  AI_CORE_SMOKE_SITE_ID,
  assertExactSmokeCase,
  assertExactSmokeCollision,
  extractLinkedSiteId,
} from "./lib/ai-core-production-smoke-bootstrap-policy.mjs";

function netlify(args, { capture = true } = {}) {
  const isWindows = process.platform === "win32";
  if (isWindows && args.some((arg) => !/^[A-Za-z0-9:_-]+$/.test(arg))) {
    throw new Error("unsafe Netlify CLI argument refused");
  }
  const executable = isWindows ? process.env.ComSpec || "cmd.exe" : "npx";
  const executableArgs = isWindows
    ? ["/d", "/s", "/c", `npx.cmd netlify ${args.join(" ")}`]
    : ["netlify", ...args];
  return execFileSync(executable, executableArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    windowsHide: true,
  }).trim();
}

function setProductionEnv(key, value) {
  if (!/^[A-Z0-9_]+$/.test(key)) {
    throw new Error("unsafe Netlify environment variable key refused");
  }
  if (process.platform !== "win32") {
    netlify(["env:set", key, value, "--context", "production"], { capture: false });
    return;
  }
  execFileSync(
    process.env.ComSpec || "cmd.exe",
    [
      "/d",
      "/s",
      "/c",
      `npx.cmd netlify env:set ${key} "%ARKAON_SMOKE_ENV_VALUE%" --context production`,
    ],
    {
      cwd: process.cwd(),
      env: { ...process.env, ARKAON_SMOKE_ENV_VALUE: value },
      stdio: "inherit",
      windowsHide: true,
    },
  );
}

function readProductionEnv(key) {
  const value = netlify(["env:get", key, "--context", "production"]);
  if (!value) throw new Error(`Netlify production env ${key} is missing`);
  return value;
}

function generatedPassword() {
  return `ArK!${randomBytes(18).toString("base64url")}9z`;
}

async function main() {
  if (!process.argv.includes("--confirm-production")) {
    throw new Error("explicit --confirm-production flag is required");
  }

  const statusText = netlify(["status", "--json"]);
  const status = JSON.parse(statusText);
  const linkedSiteId = extractLinkedSiteId(status);
  if (linkedSiteId !== AI_CORE_SMOKE_SITE_ID) {
    throw new Error(
      `wrong Netlify site (${linkedSiteId ?? "unlinked"}); expected ${AI_CORE_SMOKE_SITE_ID}`,
    );
  }

  process.env.DATABASE_URL = readProductionEnv("DATABASE_URL");
  const adminEmail = readProductionEnv("OPS_SMOKE_ADMIN_EMAIL").toLowerCase();
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const passwords = Object.fromEntries(
    Object.keys(AI_CORE_SMOKE_ACCOUNTS).map((label) => [label, generatedPassword()]),
  );
  const hashes = Object.fromEntries(
    await Promise.all(
      Object.entries(passwords).map(async ([label, password]) => [
        label,
        await bcrypt.hash(password, 12),
      ]),
    ),
  );

  let provisioned;
  try {
    provisioned = await prisma.$transaction(async (tx) => {
      const admin = await tx.user.findUnique({ where: { email: adminEmail } });
      if (
        !admin ||
        admin.status !== "ACTIVE" ||
        !["ADMIN", "SUPER_ADMIN"].includes(admin.role)
      ) {
        throw new Error(
          "OPS_SMOKE_ADMIN_EMAIL must identify an ACTIVE ADMIN or SUPER_ADMIN",
        );
      }

      const users = {};
      for (const [label, expected] of Object.entries(AI_CORE_SMOKE_ACCOUNTS)) {
        const existing = await tx.user.findUnique({ where: { email: expected.email } });
        assertExactSmokeCollision(existing, expected, label);
        users[label] = existing
          ? await tx.user.update({
              where: { id: existing.id },
              data: { passwordHash: hashes[label], emailVerifiedAt: new Date() },
            })
          : await tx.user.create({
              data: {
                ...expected,
                status: "ACTIVE",
                passwordHash: hashes[label],
                emailVerifiedAt: new Date(),
              },
            });
      }

      await tx.lawyerProfile.upsert({
        where: { userId: users.LAWYER.id },
        create: {
          userId: users.LAWYER.id,
          registrationNumber: "ARKAON-SMOKE-NOT-A-REAL-LICENSE",
          barAssociation: "운영 스모크 전용(가상)",
          officeName: "아르카온 가상 테스트 법률사무소",
          verificationStatus: "APPROVED",
          submittedAt: new Date(),
          reviewedAt: new Date(),
          reviewedById: admin.id,
          integrityAttestationAcceptedAt: new Date(),
          integrityAttestationVersion: AI_CORE_SMOKE_MARKER,
        },
        update: {
          verificationStatus: "APPROVED",
          reviewedAt: new Date(),
          reviewedById: admin.id,
        },
      });

      const existingCase = await tx.case.findFirst({
        where: { title: AI_CORE_SMOKE_CASE_TITLE },
      });
      assertExactSmokeCase(existingCase, users.CLIENT.id);
      const description = `${AI_CORE_SMOKE_MARKER}: 실제 인물·사건이 아닌 운영 검증 전용 가상 데이터.`;
      const caseRow = existingCase
        ? await tx.case.update({
            where: { id: existingCase.id },
            data: {
              assignedLawyerUserId: users.LAWYER.id,
              assignedStaffUserId: users.STAFF.id,
              status: "INTERVIEW_DONE",
            },
          })
        : await tx.case.create({
            data: {
              ownerUserId: users.CLIENT.id,
              title: AI_CORE_SMOKE_CASE_TITLE,
              description,
              category: "차량담보대출 사기",
              opponentName: "가상 대출중개업체",
              assignedLawyerUserId: users.LAWYER.id,
              assignedStaffUserId: users.STAFF.id,
              status: "INTERVIEW_DONE",
            },
          });

      for (const assignee of [users.LAWYER, users.STAFF]) {
        const active = await tx.caseAssignment.findFirst({
          where: { caseId: caseRow.id, assigneeUserId: assignee.id, isActive: true },
        });
        if (!active) {
          await tx.caseAssignment.create({
            data: {
              caseId: caseRow.id,
              assigneeUserId: assignee.id,
              assignedByUserId: admin.id,
              note: AI_CORE_SMOKE_MARKER,
            },
          });
        }
      }

      const answersJson = { ...AI_CORE_SMOKE_ANSWERS };
      const interview = await tx.interview.findFirst({
        where: { caseId: caseRow.id },
        orderBy: { createdAt: "asc" },
      });
      if (interview) {
        await tx.interview.update({
          where: { id: interview.id },
          data: {
            status: "COMPLETED",
            startedAt: interview.startedAt ?? new Date(),
            completedAt: new Date(),
            answersJson,
          },
        });
      } else {
        await tx.interview.create({
          data: {
            caseId: caseRow.id,
            status: "COMPLETED",
            startedAt: new Date(),
            completedAt: new Date(),
            answersJson,
          },
        });
      }

      const answerMemo = await tx.caseTimelineMemo.findFirst({
        where: {
          caseId: caseRow.id,
          noteType: "CLIENT_INTERVIEW_ANSWERS",
          deletedAt: null,
        },
      });
      if (answerMemo) {
        await tx.caseTimelineMemo.update({
          where: { id: answerMemo.id },
          data: { content: JSON.stringify(answersJson), authorUserId: users.CLIENT.id },
        });
      } else {
        await tx.caseTimelineMemo.create({
          data: {
            caseId: caseRow.id,
            authorUserId: users.CLIENT.id,
            noteType: "CLIENT_INTERVIEW_ANSWERS",
            content: JSON.stringify(answersJson),
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorUserId: admin.id,
          action: "AI_CORE_PRODUCTION_SMOKE_BOOTSTRAP",
          entityType: "Case",
          entityId: caseRow.id,
          message: "Created or refreshed dedicated fictional ARKAON production smoke fixtures",
          metadata: {
            marker: AI_CORE_SMOKE_MARKER,
            accountEmails: Object.values(AI_CORE_SMOKE_ACCOUNTS).map((x) => x.email),
            destructiveOperations: false,
            externalMessages: false,
            payments: false,
          },
        },
      });
      return { caseId: caseRow.id };
    });
  } finally {
    await prisma.$disconnect();
    delete process.env.DATABASE_URL;
  }

  const envValues = {
    OPS_SMOKE_CLIENT_EMAIL: AI_CORE_SMOKE_ACCOUNTS.CLIENT.email,
    OPS_SMOKE_CLIENT_PASSWORD: passwords.CLIENT,
    OPS_SMOKE_LAWYER_EMAIL: AI_CORE_SMOKE_ACCOUNTS.LAWYER.email,
    OPS_SMOKE_LAWYER_PASSWORD: passwords.LAWYER,
    OPS_SMOKE_STAFF_EMAIL: AI_CORE_SMOKE_ACCOUNTS.STAFF.email,
    OPS_SMOKE_STAFF_PASSWORD: passwords.STAFF,
    OPS_SMOKE_CASE_ID: provisioned.caseId,
  };
  for (const [key, value] of Object.entries(envValues)) {
    setProductionEnv(key, value);
  }

  console.log(`PASS — fictional smoke case ${provisioned.caseId} provisioned`);
  console.log("PASS — CLIENT/LAWYER/STAFF credentials synced to Netlify production");
  console.log("No password values were printed; no external messages, payments, or deletes occurred.");
}

main().catch((error) => {
  console.error(`[ops-ai-core-production-smoke-bootstrap] ${error.message ?? error}`);
  process.exit(1);
});