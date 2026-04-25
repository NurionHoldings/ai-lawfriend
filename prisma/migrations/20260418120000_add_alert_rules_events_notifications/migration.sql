-- CreateEnum
CREATE TYPE "AlertRuleType" AS ENUM ('ROLE_SPIKE', 'NIGHT_ACTIVITY', 'ACTION_POLICY');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertEventStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'IGNORED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ALERT_EVENT', 'SYSTEM');

-- CreateTable
CREATE TABLE "AlertRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "AlertRuleType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'WARNING',
    "configJson" JSONB NOT NULL,
    "description" TEXT,
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertEvent" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT,
    "status" "AlertEventStatus" NOT NULL DEFAULT 'OPEN',
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "actorUserId" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedById" TEXT,
    "ignoredAt" TIMESTAMP(3),
    "ignoredById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "payloadJson" JSONB NOT NULL,

    CONSTRAINT "AlertEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminNotification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'ALERT_EVENT',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "targetHref" TEXT,
    "userId" TEXT NOT NULL,
    "alertEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlertRule_code_key" ON "AlertRule"("code");

-- CreateIndex
CREATE INDEX "AlertRule_enabled_type_idx" ON "AlertRule"("enabled", "type");

-- CreateIndex
CREATE INDEX "AlertRule_createdAt_idx" ON "AlertRule"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AlertEvent_fingerprint_key" ON "AlertEvent"("fingerprint");

-- CreateIndex
CREATE INDEX "AlertEvent_status_detectedAt_idx" ON "AlertEvent"("status", "detectedAt");

-- CreateIndex
CREATE INDEX "AlertEvent_severity_detectedAt_idx" ON "AlertEvent"("severity", "detectedAt");

-- CreateIndex
CREATE INDEX "AlertEvent_entityType_entityId_idx" ON "AlertEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AlertEvent_actorUserId_detectedAt_idx" ON "AlertEvent"("actorUserId", "detectedAt");

-- CreateIndex
CREATE INDEX "AdminNotification_userId_readAt_createdAt_idx" ON "AdminNotification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "AdminNotification_alertEventId_idx" ON "AdminNotification"("alertEventId");

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "AlertRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_ignoredById_fkey" FOREIGN KEY ("ignoredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminNotification" ADD CONSTRAINT "AdminNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminNotification" ADD CONSTRAINT "AdminNotification_alertEventId_fkey" FOREIGN KEY ("alertEventId") REFERENCES "AlertEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
