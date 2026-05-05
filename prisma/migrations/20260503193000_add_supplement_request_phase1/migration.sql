-- CreateEnum
CREATE TYPE "SupplementRequestStatus" AS ENUM ('DRAFT', 'SENT', 'CLIENT_VIEWED', 'CLIENT_RESPONDED', 'UNDER_REVIEW', 'NEEDS_MORE_INFO', 'ACCEPTED', 'CLOSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SupplementRequestType" AS ENUM ('MISSING_FACT', 'UNCLEAR_FACT', 'ADDITIONAL_EVIDENCE', 'DOCUMENT_CLARIFICATION', 'PARTY_INFO', 'TIMELINE_CONFIRMATION', 'DAMAGE_DETAIL', 'CONSENT_OR_NOTICE', 'OTHER');

-- CreateEnum
CREATE TYPE "SupplementAttachmentRole" AS ENUM ('EVIDENCE', 'REFERENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "SupplementRequestAuditActionType" AS ENUM ('CREATE', 'UPDATE', 'SEND', 'CANCEL', 'EXPIRE', 'RESPOND', 'START_REVIEW', 'ACCEPT', 'NEEDS_MORE_INFO', 'CLOSE', 'STATUS_LOG_VIEW', 'AUDIT_LOG_VIEW');

-- CreateTable
CREATE TABLE "SupplementRequest" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "requesterUserId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "status" "SupplementRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "requestType" "SupplementRequestType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "clientViewedAt" TIMESTAMP(3),
    "lastRespondedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "revisionRound" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplementRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplementRequestItem" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "itemType" "SupplementRequestType" NOT NULL,
    "itemLabel" TEXT NOT NULL,
    "itemPrompt" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "expectedFormat" TEXT,
    "maxLength" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplementRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplementResponse" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "requestItemId" TEXT,
    "responderUserId" TEXT NOT NULL,
    "responderRole" "UserRole" NOT NULL,
    "responseText" TEXT,
    "responseJson" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisionRound" INTEGER NOT NULL DEFAULT 0,
    "isAcceptedSnapshot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplementResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplementResponseAttachment" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "caseAttachmentId" TEXT NOT NULL,
    "attachmentRole" "SupplementAttachmentRole" NOT NULL DEFAULT 'EVIDENCE',
    "note" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplementResponseAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplementRequestStatusLog" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "fromStatus" "SupplementRequestStatus" NOT NULL,
    "toStatus" "SupplementRequestStatus" NOT NULL,
    "actorUserId" TEXT,
    "actorRole" "UserRole" NOT NULL,
    "reasonCode" TEXT,
    "reasonMemo" TEXT,
    "ipMasked" TEXT,
    "userAgentMasked" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplementRequestStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplementRequestAuditLog" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "actionType" "SupplementRequestAuditActionType" NOT NULL,
    "actorUserId" TEXT,
    "actorRole" "UserRole" NOT NULL,
    "actionSummary" TEXT NOT NULL,
    "actionPayloadMasked" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplementRequestAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupplementRequest_caseId_status_createdAt_idx" ON "SupplementRequest"("caseId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SupplementRequest_requesterUserId_createdAt_idx" ON "SupplementRequest"("requesterUserId", "createdAt");

-- CreateIndex
CREATE INDEX "SupplementRequest_targetUserId_createdAt_idx" ON "SupplementRequest"("targetUserId", "createdAt");

-- CreateIndex
CREATE INDEX "SupplementRequest_isDeleted_updatedAt_idx" ON "SupplementRequest"("isDeleted", "updatedAt");

-- CreateIndex
CREATE INDEX "SupplementRequestItem_requestId_sortOrder_idx" ON "SupplementRequestItem"("requestId", "sortOrder");

-- CreateIndex
CREATE INDEX "SupplementResponse_requestId_submittedAt_idx" ON "SupplementResponse"("requestId", "submittedAt");

-- CreateIndex
CREATE INDEX "SupplementResponse_responderUserId_submittedAt_idx" ON "SupplementResponse"("responderUserId", "submittedAt");

-- CreateIndex
CREATE INDEX "SupplementResponseAttachment_responseId_createdAt_idx" ON "SupplementResponseAttachment"("responseId", "createdAt");

-- CreateIndex
CREATE INDEX "SupplementResponseAttachment_caseAttachmentId_idx" ON "SupplementResponseAttachment"("caseAttachmentId");

-- CreateIndex
CREATE INDEX "SupplementRequestStatusLog_requestId_createdAt_idx" ON "SupplementRequestStatusLog"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "SupplementRequestStatusLog_actorUserId_createdAt_idx" ON "SupplementRequestStatusLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "SupplementRequestAuditLog_requestId_createdAt_idx" ON "SupplementRequestAuditLog"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "SupplementRequestAuditLog_actorUserId_createdAt_idx" ON "SupplementRequestAuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "SupplementRequestAuditLog_actionType_createdAt_idx" ON "SupplementRequestAuditLog"("actionType", "createdAt");

-- AddForeignKey
ALTER TABLE "SupplementRequest" ADD CONSTRAINT "SupplementRequest_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementRequest" ADD CONSTRAINT "SupplementRequest_requesterUserId_fkey" FOREIGN KEY ("requesterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementRequest" ADD CONSTRAINT "SupplementRequest_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementRequestItem" ADD CONSTRAINT "SupplementRequestItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SupplementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementResponse" ADD CONSTRAINT "SupplementResponse_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SupplementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementResponse" ADD CONSTRAINT "SupplementResponse_requestItemId_fkey" FOREIGN KEY ("requestItemId") REFERENCES "SupplementRequestItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementResponse" ADD CONSTRAINT "SupplementResponse_responderUserId_fkey" FOREIGN KEY ("responderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementResponseAttachment" ADD CONSTRAINT "SupplementResponseAttachment_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "SupplementResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementResponseAttachment" ADD CONSTRAINT "SupplementResponseAttachment_caseAttachmentId_fkey" FOREIGN KEY ("caseAttachmentId") REFERENCES "CaseAttachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementRequestStatusLog" ADD CONSTRAINT "SupplementRequestStatusLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SupplementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementRequestStatusLog" ADD CONSTRAINT "SupplementRequestStatusLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementRequestAuditLog" ADD CONSTRAINT "SupplementRequestAuditLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SupplementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementRequestAuditLog" ADD CONSTRAINT "SupplementRequestAuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

