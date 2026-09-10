import { Prisma, type PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  AI_CORE_SMOKE_ACCOUNTS,
  AI_CORE_SMOKE_ANSWERS,
  AI_CORE_SMOKE_BOOTSTRAP_ACTION,
  AI_CORE_SMOKE_CASE_TITLE,
  AI_CORE_SMOKE_MARKER,
  assertExactSmokeCase,
  assertExactSmokeCollision,
  ensureSmokeAdministrator,
} from "../../../scripts/lib/ai-core-production-smoke-bootstrap-policy.mjs";

export type SmokeAccountLabel = "CLIENT" | "LAWYER" | "STAFF";

export type ProductionSmokeBootstrapResult = {
  caseId: string;
  adminCreated: boolean;
  alreadyProvisioned: boolean;
};

type ProvisionProductionSmokeFixturesInput = {
  prisma: PrismaClient;
  adminEmail: string;
  adminPassword: string;
  accountPasswords: Record<SmokeAccountLabel, string>;
};

const ADVISORY_LOCK_ERROR_CODE = "ARKAON_ADVISORY_LOCK_FAILED";

class ProductionSmokeAdvisoryLockError extends Error {
  readonly code = ADVISORY_LOCK_ERROR_CODE;

  constructor(cause: unknown) {
    super("production smoke advisory lock query failed", { cause });
    this.name = "ProductionSmokeAdvisoryLockError";
  }
}

/**
 * The single write implementation shared by the local operator script and the
 * production-only Netlify runtime route. The advisory transaction lock and
 * completion audit make the operation exactly-once across concurrent workers.
 */
export async function provisionProductionSmokeFixtures({
  prisma,
  adminEmail,
  adminPassword,
  accountPasswords,
}: ProvisionProductionSmokeFixturesInput): Promise<ProductionSmokeBootstrapResult> {
  try {
    return await prisma.$transaction(
      async (tx) => {
        try {
          await tx.$queryRaw(
            Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${AI_CORE_SMOKE_MARKER}))`,
          );
        } catch (error) {
          throw new ProductionSmokeAdvisoryLockError(error);
        }

        const completed = await tx.auditLog.findFirst({
          where: {
            action: AI_CORE_SMOKE_BOOTSTRAP_ACTION,
            entityType: "Case",
          },
          orderBy: { createdAt: "asc" },
          select: { entityId: true },
        });
        if (completed?.entityId) {
          return {
            caseId: completed.entityId,
            adminCreated: false,
            alreadyProvisioned: true,
          };
        }

        const hashes = Object.fromEntries(
          await Promise.all(
            Object.entries(accountPasswords).map(async ([label, password]) => [
              label,
              await bcrypt.hash(password, 12),
            ]),
          ),
        ) as Record<SmokeAccountLabel, string>;
        const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

        const { admin, created: adminCreated } = await ensureSmokeAdministrator(
          {
            tx,
            email: adminEmail,
            password: adminPassword,
            passwordHash: adminPasswordHash,
            verifyPassword: bcrypt.compare,
          },
        );

        const users: Record<SmokeAccountLabel, { id: string }> = {
          CLIENT: { id: "" },
          LAWYER: { id: "" },
          STAFF: { id: "" },
        };
        for (const [label, expected] of Object.entries(
          AI_CORE_SMOKE_ACCOUNTS,
        ) as Array<
          [
            SmokeAccountLabel,
            { email: string; name: string; role: "USER" | "LAWYER" | "STAFF" },
          ]
        >) {
          const existing = await tx.user.findUnique({
            where: { email: expected.email },
          });
          assertExactSmokeCollision(existing, expected, label);
          users[label] = existing
            ? await tx.user.update({
                where: { id: existing.id },
                data: {
                  passwordHash: hashes[label],
                  emailVerifiedAt: new Date(),
                },
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
            where: {
              caseId: caseRow.id,
              assigneeUserId: assignee.id,
              isActive: true,
            },
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
            data: {
              content: JSON.stringify(answersJson),
              authorUserId: users.CLIENT.id,
            },
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
            action: AI_CORE_SMOKE_BOOTSTRAP_ACTION,
            entityType: "Case",
            entityId: caseRow.id,
            message:
              "Created dedicated fictional ARKAON production smoke fixtures",
            metadata: {
              marker: AI_CORE_SMOKE_MARKER,
              accountEmails: Object.values(AI_CORE_SMOKE_ACCOUNTS).map(
                (account) => account.email,
              ),
              destructiveOperations: false,
              externalMessages: false,
              payments: false,
            },
          },
        });
        return {
          caseId: caseRow.id,
          adminCreated,
          alreadyProvisioned: false,
        };
      },
      {
        isolationLevel: "Serializable",
        maxWait: 10_000,
        timeout: 30_000,
      },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2002" || error.code === "P2034")
    ) {
      throw new Error(
        "bootstrap uniqueness or serialization conflict detected; transaction was aborted without an automatic retry",
      );
    }
    throw error;
  }
}
