import { prisma } from "@/lib/prisma";
import { autoAssignIllegalLendingLawyer } from "./illegal-lending-lawyer-assignment";
import type { IllegalLendingPredeployCheckItem } from "./illegal-lending-predeploy-check.types";

export async function checkIllegalLendingLawyerAssignmentData(): Promise<IllegalLendingPredeployCheckItem> {
  try {
    const lawyerCount = await prisma.user.count({
      where: {
        role: "LAWYER",
      },
    });

    if (lawyerCount === 0) {
      return {
        key: "lawyer-auto-assignment",
        title: "변호사 자동배정 후보군 검증",
        status: "FAIL",
        message: "운영 DB에서 role=LAWYER 변호사 후보를 찾지 못했습니다.",
        detail: {
          lawyerCount,
        },
      };
    }

    const selected = await autoAssignIllegalLendingLawyer();

    if (!selected) {
      return {
        key: "lawyer-auto-assignment",
        title: "변호사 자동배정 선택 검증",
        status: "WARN",
        message:
          "변호사 후보는 있으나 자동배정 결과가 없습니다. 자동배정 비활성화 여부를 확인해야 합니다.",
        detail: {
          lawyerCount,
          autoAssignEnabled: process.env.ILLEGAL_LENDING_AUTO_ASSIGN_ENABLED !== "false",
        },
      };
    }

    return {
      key: "lawyer-auto-assignment",
      title: "변호사 자동배정 실데이터 검증",
      status: "PASS",
      message: "운영 DB 변호사 후보군 조회와 자동배정 선택이 통과했습니다.",
      detail: {
        lawyerCount,
        selectedLawyerId: selected.lawyerId,
        selectedLawyerName: selected.lawyerName,
        reason: selected.reason,
      },
    };
  } catch (error) {
    return {
      key: "lawyer-auto-assignment",
      title: "변호사 자동배정 실데이터 검증",
      status: "FAIL",
      message:
        error instanceof Error
          ? error.message
          : "변호사 자동배정 실데이터 검증 중 알 수 없는 오류가 발생했습니다.",
    };
  }
}