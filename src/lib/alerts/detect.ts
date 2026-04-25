import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveAlertTargetHref } from "@/lib/alerts/deep-link";
import { buildAlertFingerprint } from "@/lib/alerts/fingerprint";
import { computeSlaState } from "@/lib/alerts/sla";
import { buildDueAtFromRule } from "@/lib/alerts/sla-rule";
import type {
  ActionPolicyRuleConfig,
  NightActivityRuleConfig,
  RoleSpikeRuleConfig,
} from "@/lib/alerts/types";

type DetectionDraft = {
  ruleId: string;
  ruleCode: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  actorUserId?: string | null;
  payloadJson: unknown;
  bucketKey: string;
};

function expandRoleTargets(targets: string[]): UserRole[] {
  const roles = new Set<UserRole>();
  for (const t of targets) {
    if (t === "ADMIN") {
      roles.add(UserRole.ADMIN);
      roles.add(UserRole.SUPER_ADMIN);
    } else if (t === "LAWYER") {
      roles.add(UserRole.LAWYER);
    } else if (t === "USER") {
      roles.add(UserRole.USER);
    }
  }
  return [...roles];
}

function getNow() {
  return new Date();
}

function subHours(date: Date, hours: number) {
  return new Date(date.getTime() - hours * 60 * 60 * 1000);
}

function hourInNightRange(hour: number, startHour: number, endHour: number) {
  if (startHour === endHour) return true;
  if (startHour < endHour) {
    return hour >= startHour && hour < endHour;
  }
  return hour >= startHour || hour < endHour;
}

export async function runAlertDetection() {
  const rules = await prisma.alertRule.findMany({
    where: { enabled: true },
    orderBy: { createdAt: "asc" },
  });

  const drafts: DetectionDraft[] = [];

  for (const rule of rules) {
    if (rule.type === "ROLE_SPIKE") {
      drafts.push(
        ...(await detectRoleSpike(
          rule.id,
          rule.code,
          rule.severity,
          rule.configJson as RoleSpikeRuleConfig
        ))
      );
    }

    if (rule.type === "NIGHT_ACTIVITY") {
      drafts.push(
        ...(await detectNightActivity(
          rule.id,
          rule.code,
          rule.severity,
          rule.configJson as NightActivityRuleConfig
        ))
      );
    }

    if (rule.type === "ACTION_POLICY") {
      drafts.push(
        ...(await detectActionPolicy(
          rule.id,
          rule.code,
          rule.severity,
          rule.configJson as ActionPolicyRuleConfig
        ))
      );
    }
  }

  let createdCount = 0;

  for (const draft of drafts) {
    const fingerprint = buildAlertFingerprint({
      ruleCode: draft.ruleCode,
      bucketKey: draft.bucketKey,
      entityType: draft.entityType,
      entityId: draft.entityId,
      actorUserId: draft.actorUserId,
    });

    const rule = rules.find((r) => r.id === draft.ruleId);
    const now = getNow();
    const dueAt = buildDueAtFromRule({
      detectedAt: now,
      slaHours: rule?.slaHours ?? null,
    });
    const dueSoonH = rule?.dueSoonHours ?? null;
    const slaState = computeSlaState({
      dueAt,
      status: "OPEN",
      dueSoonHours: dueSoonH ?? undefined,
    });

    const created = await prisma.alertEvent.upsert({
      where: { fingerprint },
      update: {},
      create: {
        ruleId: draft.ruleId,
        severity: draft.severity,
        title: draft.title,
        message: draft.message,
        entityType: draft.entityType,
        entityId: draft.entityId,
        actorUserId: draft.actorUserId,
        payloadJson: draft.payloadJson as object,
        fingerprint,
        slaHours: rule?.slaHours ?? null,
        dueSoonHours: dueSoonH,
        dueAt,
        slaState,
      },
    });

    const wasNotificationCreated = await createAdminNotificationsForOpenAlert(
      created.id,
      draft.title,
      draft.message
    );
    if (wasNotificationCreated) createdCount += 1;
  }

  return {
    scannedRuleCount: rules.length,
    detectedDraftCount: drafts.length,
    createdAlertCount: createdCount,
  };
}

async function createAdminNotificationsForOpenAlert(
  alertEventId: string,
  title: string,
  body: string
) {
  const alertEvent = await prisma.alertEvent.findUnique({
    where: { id: alertEventId },
    select: {
      id: true,
      entityType: true,
      entityId: true,
      payloadJson: true,
    },
  });

  if (!alertEvent) return false;

  const targetHref = resolveAlertTargetHref(alertEvent) ?? "/admin/alerts/history";

  const admins = await prisma.user.findMany({
    where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
    select: { id: true },
  });

  let created = false;

  for (const admin of admins) {
    const exists = await prisma.adminNotification.findFirst({
      where: {
        userId: admin.id,
        alertEventId,
      },
      select: { id: true },
    });

    if (!exists) {
      await prisma.adminNotification.create({
        data: {
          userId: admin.id,
          alertEventId,
          type: "ALERT_EVENT",
          title,
          body,
          targetHref,
        },
      });
      created = true;
    }
  }

  return created;
}

async function detectRoleSpike(
  ruleId: string,
  ruleCode: string,
  severity: "INFO" | "WARNING" | "CRITICAL",
  config: RoleSpikeRuleConfig
): Promise<DetectionDraft[]> {
  const now = getNow();
  const currentFrom = subHours(now, config.timeWindowHours);
  const previousFrom = subHours(currentFrom, config.timeWindowHours);

  const prismaRoles = expandRoleTargets(config.roleTargets);
  if (prismaRoles.length === 0) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      role: { in: prismaRoles },
    },
    select: { id: true, role: true, name: true, email: true },
  });

  const result: DetectionDraft[] = [];

  for (const user of users) {
    const currentCount = await prisma.auditLog.count({
      where: {
        actorUserId: user.id,
        createdAt: { gte: currentFrom, lt: now },
      },
    });

    const previousCount = await prisma.auditLog.count({
      where: {
        actorUserId: user.id,
        createdAt: { gte: previousFrom, lt: currentFrom },
      },
    });

    const baseline = Math.max(previousCount, 1);
    const multiplier = currentCount / baseline;

    if (currentCount >= config.minCount && multiplier >= config.spikeMultiplier) {
      result.push({
        ruleId,
        ruleCode,
        severity,
        title: `[역할별 급증] ${user.role} 사용자 활동 급증`,
        message: `${user.name ?? user.email ?? user.id} 사용자의 최근 ${config.timeWindowHours}시간 활동 수가 ${currentCount}건으로, 직전 동일 구간 ${previousCount}건 대비 ${multiplier.toFixed(1)}배입니다.`,
        actorUserId: user.id,
        payloadJson: {
          userId: user.id,
          role: user.role,
          currentCount,
          previousCount,
          multiplier,
          timeWindowHours: config.timeWindowHours,
        },
        bucketKey: `ROLE_SPIKE:${user.id}:${currentFrom.toISOString()}`,
      });
    }
  }

  return result;
}

async function detectNightActivity(
  ruleId: string,
  ruleCode: string,
  severity: "INFO" | "WARNING" | "CRITICAL",
  config: NightActivityRuleConfig
): Promise<DetectionDraft[]> {
  const now = getNow();
  const from = subHours(now, 24);

  const logs = await prisma.auditLog.findMany({
    where: {
      createdAt: { gte: from, lte: now },
    },
    select: {
      id: true,
      action: true,
      createdAt: true,
      actorUserId: true,
      entityType: true,
      entityId: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const filtered = logs.filter((log) => {
    const hour = log.createdAt.getHours();
    const isNight = hourInNightRange(hour, config.startHour, config.endHour);
    const isWhitelisted = config.whitelistActionTypes.includes(log.action);
    return isNight && !isWhitelisted;
  });

  const grouped = new Map<string, typeof filtered>();

  for (const log of filtered) {
    const key = log.actorUserId ?? "UNKNOWN";
    const bucket = grouped.get(key) ?? [];
    bucket.push(log);
    grouped.set(key, bucket);
  }

  const result: DetectionDraft[] = [];

  for (const [actorUserId, items] of grouped) {
    if (items.length < config.minCount) continue;

    const top = items[0];
    result.push({
      ruleId,
      ruleCode,
      severity,
      title: `[심야 이상활동] 심야 시간대 로그 다수 감지`,
      message: `최근 24시간 동안 심야 구간(${config.startHour}:00 ~ ${config.endHour}:00) 비허용 액션이 ${items.length}건 감지되었습니다.`,
      actorUserId: actorUserId === "UNKNOWN" ? null : actorUserId,
      entityType: top.entityType,
      entityId: top.entityId,
      payloadJson: {
        count: items.length,
        startHour: config.startHour,
        endHour: config.endHour,
        sampleLogIds: items.slice(0, 20).map((x) => x.id),
        sampleActions: items.slice(0, 10).map((x) => x.action),
      },
      bucketKey: `NIGHT_ACTIVITY:${actorUserId}:${from.toISOString().slice(0, 13)}`,
    });
  }

  return result;
}

async function detectActionPolicy(
  ruleId: string,
  ruleCode: string,
  severity: "INFO" | "WARNING" | "CRITICAL",
  config: ActionPolicyRuleConfig
): Promise<DetectionDraft[]> {
  const now = getNow();
  const from = subHours(now, 24);

  const logs = await prisma.auditLog.findMany({
    where: {
      createdAt: { gte: from, lte: now },
    },
    select: {
      id: true,
      action: true,
      createdAt: true,
      actorUserId: true,
      entityType: true,
      entityId: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const result: DetectionDraft[] = [];

  for (const log of logs) {
    let matched = false;
    let reason = "";

    if (config.mode === "BLACKLIST_ONLY") {
      matched = config.blacklist.includes(log.action);
      reason = "blacklist";
    } else if (config.mode === "WHITELIST_ONLY") {
      matched = !config.whitelist.includes(log.action);
      reason = "not-in-whitelist";
    } else {
      matched =
        config.blacklist.includes(log.action) || !config.whitelist.includes(log.action);
      reason = config.blacklist.includes(log.action) ? "blacklist" : "not-in-whitelist";
    }

    if (!matched) continue;

    result.push({
      ruleId,
      ruleCode,
      severity,
      title: `[액션 정책 경고] 허용정책 위반 액션 감지`,
      message: `액션 "${log.action}" 이(가) ${reason} 규칙에 의해 경고 처리되었습니다.`,
      actorUserId: log.actorUserId,
      entityType: log.entityType,
      entityId: log.entityId,
      payloadJson: {
        action: log.action,
        reason,
        config,
        auditLogId: log.id,
        createdAt: log.createdAt.toISOString(),
      },
      bucketKey: `ACTION_POLICY:${log.id}`,
    });
  }

  return result;
}
