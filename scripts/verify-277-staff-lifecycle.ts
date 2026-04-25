/**
 * [277] 독립 실검: STAFF·완료 후 상태·allowedActions
 * - 정적: Prisma role + CaseStatus → getAllowedLifecycleActionsForCase
 * - 선택: DATABASE_URL 이 있으면 STAFF 유저·배정(활성) 1건 스냅샷(읽기 전용)
 *
 * 실행: npx tsx scripts/verify-277-staff-lifecycle.ts
 */
import { PrismaClient } from "@prisma/client";
import { getAllowedLifecycleActionsForCase } from "../src/lib/cases/allowed-actions";

function staticMatrix() {
  const rows = {
    "IN_INTERVIEW+STAFF": getAllowedLifecycleActionsForCase("IN_INTERVIEW", "STAFF"),
    "INTERVIEW_DONE+STAFF": getAllowedLifecycleActionsForCase("INTERVIEW_DONE", "STAFF"),
    "INTERVIEW_DONE+LAWYER": getAllowedLifecycleActionsForCase("INTERVIEW_DONE", "LAWYER"),
  };
  return rows;
}

async function main() {
  console.log("=== [277] verify-277-staff-lifecycle (static) ===\n");
  console.log(JSON.stringify(staticMatrix(), null, 2));

  if (!process.env.DATABASE_URL) {
    console.log(
      "\n[277] DATABASE_URL 없음 — DB 스냅샷 생략 (로컬/CI에서 .env로 재실행 가능)",
    );
    return;
  }

  const prisma = new PrismaClient();
  try {
    const staffUser = await prisma.user.findFirst({
      where: { role: "STAFF", status: "ACTIVE" },
      select: { id: true, email: true, role: true },
    });
    const assignment = await prisma.caseAssignment.findFirst({
      where: { isActive: true, assigneeUserId: staffUser?.id },
      include: {
        case: { select: { id: true, status: true, title: true } },
      },
    });
    const anyStaffAssignment = await prisma.caseAssignment.findFirst({
      where: { isActive: true, assignee: { role: "STAFF" } },
      include: {
        assignee: { select: { id: true, email: true } },
        case: { select: { id: true, status: true, title: true } },
      },
    });

    console.log("\n=== [277] DB snapshot (read-only) ===\n");
    console.log(
      JSON.stringify(
        {
          staffUser,
          assignmentForThatUser: assignment,
          anyStaffActiveAssignment: anyStaffAssignment,
        },
        null,
        2,
      ),
    );
    if (!anyStaffAssignment) {
      console.log(
        "\n[277] 힌트: 시드( prisma/seed.ts )는 STAFF 계정만 있고 CaseAssignment는 없을 수 있음. 수동으로 사건 배정 후 재실행.",
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
