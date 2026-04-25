import { prisma } from "@/lib/prisma";

export type ApprovalHistoryItem = {
  action: string;
  actorName: string;
  actorRole: string;
  createdAt: string;
};

/**
 * 문서 관련 감사 로그 및 검토자 정보를 바탕으로 승인 이력 후보를 반환합니다.
 * 감사 로그가 없으면 빈 배열이며, 검증 서비스에서 잠금자(lockedById)로 보강합니다.
 */
export const documentApprovalRepository = {
  async listApprovalHistory(
    documentId: string,
    _caseId: string, // 향후 사건 범위 필터용
  ): Promise<ApprovalHistoryItem[]> {
    void _caseId;
    const logs = await prisma.auditLog.findMany({
      where: {
        entityId: documentId,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        actor: {
          select: { name: true, role: true },
        },
      },
    });

    return logs.map((row) => ({
      action: row.action,
      actorName: row.actor.name,
      actorRole: String(row.actor.role),
      createdAt: row.createdAt.toISOString(),
    }));
  },
};
