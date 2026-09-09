BEGIN;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
    ) THEN
        RAISE EXCEPTION 'Production baseline aborted: public schema is not empty';
    END IF;
END
$$;
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'LAWYER', 'STAFF', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TenantMembershipRole" AS ENUM ('OWNER', 'ADMIN', 'LAWYER', 'STAFF');

-- CreateEnum
CREATE TYPE "TenantPlanTier" AS ENUM ('FREE', 'STARTER', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "TenantPlanStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TenantUsageEventKind" AS ENUM ('AI_TOKEN_USAGE', 'LLM_CALL', 'EXTERNAL_MESSAGE', 'DOCUMENT_PROCESSING', 'FILE_UPLOAD', 'CLIENT_PORTAL_ACTIVE');

-- CreateEnum
CREATE TYPE "TenantUsageEventUnit" AS ENUM ('COUNT', 'TOKENS', 'BYTES');

-- CreateEnum
CREATE TYPE "BillingLedgerStatus" AS ENUM ('DRAFT', 'POSTED', 'VOIDED', 'ADJUSTED');

-- CreateEnum
CREATE TYPE "BillingChargeCategory" AS ENUM ('AI_TOKEN', 'LLM_CALL', 'EXTERNAL_MESSAGE', 'DOCUMENT_PROCESSING', 'FILE_UPLOAD', 'FILE_STORAGE', 'CLIENT_PORTAL', 'MANUAL_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "CustomerSuccessActivityType" AS ENUM ('ONBOARDING_MEETING', 'TRAINING_SESSION', 'FEATURE_INQUIRY', 'INCIDENT_NOTICE', 'EXPANSION_PROPOSAL', 'RENEWAL_DISCUSSION', 'COMPLAINT_RISK_RESPONSE');

-- CreateEnum
CREATE TYPE "ChurnRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AiEvaluationCasePackType" AS ENUM ('LOAN', 'LEASE', 'DIVORCE', 'DAMAGES', 'LABOR', 'CRIMINAL', 'GENERIC');

-- CreateEnum
CREATE TYPE "LawyerVerificationStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'NEEDS_MORE_INFO', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'KAKAO', 'NAVER');

-- CreateEnum
CREATE TYPE "LegalFormProvider" AS ENUM ('SCOURT', 'POLICE', 'SPO', 'LAW_GO_KR', 'KLAC', 'INTERNAL_STANDARD', 'OTHER');

-- CreateEnum
CREATE TYPE "LegalFormSourceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('CREATED', 'INTAKE_PENDING', 'IN_INTERVIEW', 'INTERVIEW_DONE', 'DRAFTING', 'REVIEW_PENDING', 'APPROVED', 'DELIVERED', 'CLOSED', 'HOLD', 'REJECTED', 'DELETED');

-- CreateEnum
CREATE TYPE "LawyerMatchingRecommendationStatus" AS ENUM ('DRAFT', 'REVIEW_REQUIRED', 'ASSIGNMENT_READY', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "LawyerMatchingRecommendationGeneratedBy" AS ENUM ('RULE_ENGINE', 'AI_ASSIST');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'REOPENED');

-- CreateEnum
CREATE TYPE "LegalDocumentType" AS ENUM ('STATEMENT', 'OPINION', 'CONSULT_NOTE');

-- CreateEnum
CREATE TYPE "LegalDocumentStatus" AS ENUM ('NOT_CREATED', 'DRAFT', 'REVIEW_REQUIRED', 'APPROVED', 'LOCKED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LegalParagraphStatus" AS ENUM ('DRAFT', 'REVIEW_REQUIRED', 'APPROVED', 'LOCKED');

-- CreateEnum
CREATE TYPE "QuestionSetStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AttachmentStatus" AS ENUM ('ACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "LitigationExtractionStatus" AS ENUM ('PENDING', 'EXTRACTING', 'EXTRACTED', 'FAILED');

-- CreateEnum
CREATE TYPE "LitigationExtractionMethod" AS ENUM ('NATIVE', 'OCR', 'HYBRID', 'PLAIN_TEXT');

-- CreateEnum
CREATE TYPE "LitigationClassificationStatus" AS ENUM ('PENDING', 'CLASSIFYING', 'CLASSIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "LitigationSourceParty" AS ENUM ('CLIENT', 'OPPONENT', 'COURT', 'THIRD_PARTY', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "LitigationStage" AS ENUM ('PRE_FILING', 'COMPLAINT_FILED', 'ANSWER_RECEIVED', 'PREPARATORY_BRIEF', 'JUDGMENT', 'APPEAL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "LitigationSensitivityLevel" AS ENUM ('GENERAL', 'SENSITIVE', 'LAWYER_ONLY');

-- CreateEnum
CREATE TYPE "LitigationAnalysisReadiness" AS ENUM ('READY', 'NEEDS_OCR', 'LOW_QUALITY', 'ENCRYPTED', 'UNSUPPORTED');

-- CreateEnum
CREATE TYPE "LitigationDocumentAnalysisStatus" AS ENUM ('PENDING', 'ANALYZING', 'AI_ANALYZED', 'FAILED');

-- CreateEnum
CREATE TYPE "LitigationOpponentBriefAnalysisStatus" AS ENUM ('PENDING', 'ANALYZING', 'AI_ANALYZED', 'FAILED');

-- CreateEnum
CREATE TYPE "LitigationEvidenceMappingStatus" AS ENUM ('PENDING', 'RUNNING', 'AI_MAPPED', 'FAILED');

-- CreateEnum
CREATE TYPE "LitigationDocumentIntelligenceReviewPhase" AS ENUM ('PHASE_13D', 'PHASE_13E', 'PHASE_13F', 'PHASE_15B', 'PHASE_15C');

-- CreateEnum
CREATE TYPE "LitigationDeadlineStatus" AS ENUM ('OPEN', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LitigationDeadlineNotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'KAKAO_ALIMTALK');

-- CreateEnum
CREATE TYPE "LitigationDeadlineNotificationStatus" AS ENUM ('SCHEDULED', 'SENT', 'FAILED', 'CANCELLED', 'SKIPPED_NO_CONSENT');

-- CreateEnum
CREATE TYPE "LitigationDeadlineReminderOffset" AS ENUM ('D14', 'D7', 'D3', 'D1', 'D0');

-- CreateEnum
CREATE TYPE "LitigationTaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LitigationTaskKind" AS ENUM ('RISK', 'ISSUE', 'EVIDENCE_GAP', 'REBUTTAL', 'GENERAL');

-- CreateEnum
CREATE TYPE "LitigationDraftContextStatus" AS ENUM ('DRAFT', 'READY', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LitigationOpsLinkTargetType" AS ENUM ('DEADLINE', 'TASK', 'SUPPLEMENT', 'DRAFT_CONTEXT');

-- CreateEnum
CREATE TYPE "CaseAttachmentCategory" AS ENUM ('EVIDENCE', 'IDENTITY_DOC', 'CONTRACT', 'CORRESPONDENCE', 'COURT_FILING', 'FINANCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "CasePackageShareStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "CasePackageShareMode" AS ENUM ('DESIGNATED_LAWYER', 'PUBLIC_CODE_REQUEST');

-- CreateEnum
CREATE TYPE "CasePackageAccessAction" AS ENUM ('VIEW', 'DOWNLOAD', 'DENIED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "SupplementRequestStatus" AS ENUM ('DRAFT', 'SENT', 'CLIENT_VIEWED', 'CLIENT_RESPONDED', 'UNDER_REVIEW', 'NEEDS_MORE_INFO', 'ACCEPTED', 'CLOSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CaseClientPortalAccessStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ClientSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'RECEIVED', 'UNDER_REVIEW', 'ACCEPTED', 'NEEDS_MORE_INFO', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClientSubmissionKind" AS ENUM ('SUPPLEMENT', 'FREE_UPLOAD', 'CHAT_ATTACHMENT');

-- CreateEnum
CREATE TYPE "CaseConversationThreadType" AS ENUM ('GENERAL', 'SUPPLEMENT');

-- CreateEnum
CREATE TYPE "CaseSharedDocumentStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CaseDocumentDeliveryChannel" AS ENUM ('IN_APP', 'EMAIL', 'KAKAO_ALIMTALK', 'SMS');

-- CreateEnum
CREATE TYPE "CaseDocumentDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED_NO_CONSENT', 'VIEWED');

-- CreateEnum
CREATE TYPE "ExternalMessageStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED_NO_CONSENT');

-- CreateEnum
CREATE TYPE "SupplementRequestType" AS ENUM ('MISSING_FACT', 'UNCLEAR_FACT', 'ADDITIONAL_EVIDENCE', 'DOCUMENT_CLARIFICATION', 'PARTY_INFO', 'TIMELINE_CONFIRMATION', 'DAMAGE_DETAIL', 'CONSENT_OR_NOTICE', 'OTHER');

-- CreateEnum
CREATE TYPE "SupplementAttachmentRole" AS ENUM ('EVIDENCE', 'REFERENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "SupplementRequestAuditActionType" AS ENUM ('CREATE', 'UPDATE', 'SEND', 'CANCEL', 'EXPIRE', 'RESPOND', 'START_REVIEW', 'ACCEPT', 'NEEDS_MORE_INFO', 'CLOSE', 'STATUS_LOG_VIEW', 'AUDIT_LOG_VIEW');

-- CreateEnum
CREATE TYPE "GongbuhoPacketStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LegalKnowledgeIntakeStatus" AS ENUM ('DRAFT', 'MAPPING_PENDING', 'READY_FOR_RESEARCH', 'RESEARCH_IN_PROGRESS', 'LAWYER_REVIEW_PENDING', 'PACKET_DRAFT_LINKED', 'PACKET_APPROVED', 'PIPELINE_REJECTED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LegalKnowledgeResearchBriefStatus" AS ENUM ('DRAFT', 'READY_FOR_LAWYER_REVIEW', 'REVISION_REQUESTED', 'SUPERSEDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LegalKnowledgeLawyerReviewDecisionType" AS ENUM ('APPROVE_FOR_PACKET_DRAFT', 'REQUEST_BRIEF_REVISION', 'REJECT');

-- CreateEnum
CREATE TYPE "LegalKnowledgeLawyerReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REVISION_REQUESTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LegalKnowledgePacketIntent" AS ENUM ('NEW_PACKET', 'EXTEND_EXISTING');

-- CreateEnum
CREATE TYPE "VoiceTranscriptStatus" AS ENUM ('CAPTURED', 'NEEDS_CONFIRMATION', 'CONFIRMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VoiceInteractionTraceEvent" AS ENUM ('VOICE_TRANSCRIPT_CREATED', 'VOICE_TRANSCRIPT_CONFIRMED', 'VOICE_TRANSCRIPT_REJECTED', 'VOICE_INTERVIEW_ANSWER_BOUND');

-- CreateEnum
CREATE TYPE "VoicePrivacyOpsRequestType" AS ENUM ('DELETION', 'CORRECTION', 'STT_COMPLAINT');

-- CreateEnum
CREATE TYPE "VoicePrivacyOpsRequestStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VoicePrivacyOpsResolutionCode" AS ENUM ('DRAFT_PURGED', 'ESCALATED_LAWYER_REVIEW', 'USER_GUIDED_RECONFIRM', 'METADATA_ONLY_CLOSED', 'REQUEST_REJECTED');

-- CreateEnum
CREATE TYPE "TimelineMemoType" AS ENUM ('USER_NOTE', 'STAFF_NOTE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "BulkActionJobPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "BulkActionFailureCategory" AS ENUM ('VALIDATION', 'PERMISSION', 'NOT_FOUND', 'CONFLICT', 'RATE_LIMIT', 'LOCK', 'TIMEOUT', 'NETWORK', 'INTERNAL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "OpsQueuePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "OpsQueueBoardColumn" AS ENUM ('TRIAGE', 'QUEUED', 'WORKING', 'BLOCKED', 'DONE');

-- CreateEnum
CREATE TYPE "TimelineExportFormat" AS ENUM ('CSV', 'JSON');

-- CreateEnum
CREATE TYPE "AiLawyerReviewFeedbackRating" AS ENUM ('ACCEPT', 'MINOR_EDIT', 'MAJOR_EDIT', 'REJECT');

-- CreateEnum
CREATE TYPE "AlertRuleType" AS ENUM ('ROLE_SPIKE', 'NIGHT_ACTIVITY', 'ACTION_POLICY');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertEventStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'IGNORED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ALERT_EVENT', 'SYSTEM', 'BULK_JOB_SUCCESS', 'BULK_JOB_PARTIAL_SUCCESS', 'BULK_JOB_FAILED', 'BULK_JOB_CANCELED');

-- CreateEnum
CREATE TYPE "AlertSlaState" AS ENUM ('ON_TRACK', 'DUE_SOON', 'OVERDUE');

-- CreateEnum
CREATE TYPE "AlertSlaWarningStatus" AS ENUM ('OPEN', 'CLEARED');

-- CreateEnum
CREATE TYPE "AlertEscalationLevel" AS ENUM ('NONE', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3');

-- CreateEnum
CREATE TYPE "AlertEscalationStatus" AS ENUM ('PENDING', 'SENT', 'CLEARED');

-- CreateEnum
CREATE TYPE "AlertEscalationTargetGroup" AS ENUM ('ADMINS', 'LAWYERS', 'ASSIGNEE', 'CUSTOM_USERS');

-- CreateEnum
CREATE TYPE "CronJobStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "AibeopchinCmbConfigStatus" AS ENUM ('DRAFT', 'REVIEW', 'VERIFY_PASS', 'LOCKED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "IllegalLendingReporterType" AS ENUM ('VICTIM', 'FAMILY_OR_RELATED', 'THIRD_PARTY');

-- CreateEnum
CREATE TYPE "IllegalLendingDamageType" AS ENUM ('ULTRA_HIGH_INTEREST', 'ILLEGAL_COLLECTION', 'THREAT_OR_INTIMIDATION', 'CONTACT_FAMILY_OR_WORKPLACE', 'PERSONAL_INFO_THREAT', 'SEXUAL_IMAGE_THREAT', 'UNREGISTERED_LENDER', 'FALSE_OR_MISLEADING_CONTRACT', 'OTHER');

-- CreateEnum
CREATE TYPE "IllegalLendingReportStatus" AS ENUM ('DRAFT_SUBMITTED', 'REVIEW_READY', 'REFERRED_TO_LAWYER', 'CLOSED');

-- CreateEnum
CREATE TYPE "JeonseReporterType" AS ENUM ('TENANT', 'FAMILY_OR_RELATED', 'REPRESENTATIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "JeonseDamageType" AS ENUM ('DEPOSIT_NOT_RETURNED', 'AUCTION_OR_PUBLIC_SALE', 'LANDLORD_BANKRUPTCY_OR_REHABILITATION', 'MULTIPLE_TENANT_DAMAGE', 'DOUBLE_CONTRACT_OR_FALSE_CONTRACT', 'EXCESSIVE_SENIOR_DEBT', 'TAX_ARREARS_OR_SEIZURE', 'LANDLORD_DISAPPEARED', 'BROKER_INVOLVEMENT_SUSPECTED', 'OTHER');

-- CreateEnum
CREATE TYPE "JeonseReportStatus" AS ENUM ('DRAFT_SUBMITTED', 'REVIEW_READY', 'DOCUMENTS_CHECKED', 'REFERRED_TO_LAWYER', 'CLOSED');

-- CreateEnum
CREATE TYPE "IllegalLendingAttachmentType" AS ENUM ('MESSAGE_CAPTURE', 'CALL_RECORDING', 'BANK_TRANSFER', 'CONTRACT_OR_NOTE', 'ID_OR_PERSONAL_INFO_REQUEST', 'THREAT_EVIDENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "IllegalLendingLawyerReviewStatus" AS ENUM ('REQUESTED', 'ASSIGNED', 'REVIEWING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JeonseDamageAttachmentType" AS ENUM ('LEASE_CONTRACT', 'RESIDENT_REGISTRATION', 'FIXED_DATE_PROOF', 'REGISTRY_CERTIFICATE', 'DEPOSIT_TRANSFER', 'RETURN_REQUEST_MESSAGE', 'CONTENT_CERTIFIED_MAIL', 'AUCTION_OR_SEIZURE_DOCUMENT', 'INVESTIGATION_DOCUMENT', 'BROKER_DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "JeonseDamageLawyerReviewStatus" AS ENUM ('REQUESTED', 'ASSIGNED', 'REVIEWING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WageClaimReporterType" AS ENUM ('WORKER', 'FAMILY_OR_RELATED', 'REPRESENTATIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "WageClaimEmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'DAILY', 'FREELANCER_DISPUTED', 'OTHER');

-- CreateEnum
CREATE TYPE "WageClaimDamageType" AS ENUM ('UNPAID_WAGES', 'UNPAID_SEVERANCE', 'UNPAID_OVERTIME', 'UNPAID_NIGHT_HOLIDAY', 'UNPAID_ALLOWANCE', 'MINIMUM_WAGE_VIOLATION', 'WAGE_STATEMENT_NOT_PROVIDED', 'DELAYED_PAYMENT_AFTER_RESIGNATION', 'OTHER');

-- CreateEnum
CREATE TYPE "WageClaimReportStatus" AS ENUM ('DRAFT_SUBMITTED', 'REVIEW_READY', 'DOCUMENTS_CHECKED', 'REFERRED_TO_LAWYER', 'CLOSED');

-- CreateEnum
CREATE TYPE "RetryJobSourceType" AS ENUM ('CRON', 'EXTERNAL_MESSAGE', 'BULK_ACTION', 'DOCUMENT_PIPELINE', 'AI_GOVERNANCE', 'AI_CALL', 'MANUAL');

-- CreateEnum
CREATE TYPE "RetryJobStatus" AS ENUM ('FAILED', 'PENDING_RETRY', 'RETRYING', 'SUCCEEDED', 'CANCELED', 'EXHAUSTED');

-- CreateEnum
CREATE TYPE "RetryJobSafetyClass" AS ENUM ('SAFE_AUTO', 'OPERATOR_APPROVAL', 'BLOCKED');

-- CreateEnum
CREATE TYPE "DocumentPipelineStage" AS ENUM ('UPLOAD', 'EXTRACT', 'CLASSIFY', 'ANALYZE', 'OPPONENT_BRIEF');

-- CreateEnum
CREATE TYPE "DocumentPipelineJobStatus" AS ENUM ('FAILED', 'PENDING_RECOVERY', 'RECOVERING', 'SUCCEEDED', 'BLOCKED', 'EXHAUSTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "emailVerifiedAt" TIMESTAMP(3),
    "phoneVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawyerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "barAssociation" TEXT,
    "officeName" TEXT,
    "officeAddress" TEXT,
    "officePhone" TEXT,
    "websiteUrl" TEXT,
    "specialtiesNote" TEXT,
    "verificationStatus" "LawyerVerificationStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "rejectionReason" TEXT,
    "integrityAttestationAcceptedAt" TIMESTAMP(3),
    "integrityAttestationVersion" TEXT,
    "signupRiskIpFingerprint" TEXT,
    "signupRiskUserAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LawyerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawyerVerificationDocument" (
    "id" TEXT NOT NULL,
    "lawyerProfileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT,
    "storageKey" TEXT,
    "bucket" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "checksum" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "migratedAt" TIMESTAMP(3),

    CONSTRAINT "LawyerVerificationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkActionJob" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "payloadJson" JSONB,
    "targetIdsJson" JSONB NOT NULL,
    "resultJson" JSONB,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "canceledById" TEXT,
    "cancelReason" TEXT,
    "retryOfJobId" TEXT,
    "lockedAt" TIMESTAMP(3),
    "lockToken" TEXT,
    "lockExpiresAt" TIMESTAMP(3),
    "lockId" TEXT,
    "lastHeartbeatAt" TIMESTAMP(3),
    "heartbeatCount" INTEGER NOT NULL DEFAULT 0,
    "priority" "BulkActionJobPriority" NOT NULL DEFAULT 'NORMAL',
    "queueGroup" TEXT,
    "concurrencyKey" TEXT,
    "maxConcurrency" INTEGER NOT NULL DEFAULT 2,
    "metadata" JSONB,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "completedItems" INTEGER NOT NULL DEFAULT 0,
    "failedItems" INTEGER NOT NULL DEFAULT 0,
    "canceledItems" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "retryScheduledAt" TIMESTAMP(3),

    CONSTRAINT "BulkActionJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkActionJobItem" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "errorPayload" JSONB,
    "failureCategory" "BulkActionFailureCategory",
    "failureTaxonomyCode" TEXT,
    "autoGuideCode" TEXT,
    "autoGuideLabel" TEXT,
    "autoGuideDescription" TEXT,
    "retryable" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "BulkActionJobItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkActionSchedule" (
    "id" TEXT NOT NULL,
    "sourceJobId" TEXT NOT NULL,
    "taxonomy" TEXT NOT NULL,
    "bulkVariant" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "createdRetryJobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkActionSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsQueueTicket" (
    "id" TEXT NOT NULL,
    "sourceJobId" TEXT NOT NULL,
    "caseId" TEXT,
    "taxonomy" TEXT NOT NULL,
    "bulkVariant" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "priority" "OpsQueuePriority" NOT NULL DEFAULT 'NORMAL',
    "dedupeKey" TEXT NOT NULL,
    "assigneeUserId" TEXT,
    "metadata" JSONB,
    "dueAt" TIMESTAMP(3),
    "slaMinutes" INTEGER,
    "overdueNotifiedAt" TIMESTAMP(3),
    "slaLastCheckedAt" TIMESTAMP(3),
    "boardColumn" "OpsQueueBoardColumn" NOT NULL DEFAULT 'TRIAGE',
    "boardOrder" INTEGER NOT NULL DEFAULT 0,
    "retryScheduledAt" TIMESTAMP(3),
    "retrySourceJobId" TEXT,
    "queueGroup" TEXT,
    "concurrencyKey" TEXT,
    "maxConcurrency" INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsQueueTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineExportLog" (
    "id" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "caseId" TEXT,
    "format" "TimelineExportFormat" NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineExportLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsQueueSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "jsonValue" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsQueueSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerHeartbeat" (
    "id" TEXT NOT NULL,
    "workerKey" TEXT NOT NULL,
    "workerType" TEXT NOT NULL,
    "hostname" TEXT,
    "pid" INTEGER,
    "currentJobId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "metadata" JSONB,
    "lastHeartbeatAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerHeartbeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "ownerUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "opponentName" TEXT,
    "courtName" TEXT,
    "incidentDate" TIMESTAMP(3),
    "status" "CaseStatus" NOT NULL DEFAULT 'CREATED',
    "assignedLawyerUserId" TEXT,
    "assignedStaffUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "questionSetId" TEXT,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseIntelligenceSnapshot" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "caseSummaryAiMode" TEXT NOT NULL,
    "contentJson" JSONB NOT NULL,
    "graphJson" JSONB NOT NULL,
    "radarJson" JSONB NOT NULL,
    "ledgerJson" JSONB NOT NULL,
    "gongbuhoResolutionJson" JSONB,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseIntelligenceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseClientDisclosureRelease" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "snapshotId" TEXT,
    "caseStatus" TEXT NOT NULL,
    "previewVersion" TEXT NOT NULL DEFAULT '11-B.1',
    "disclosureVersion" TEXT NOT NULL DEFAULT '10-C.1',
    "statementsJson" JSONB NOT NULL,
    "diffJson" JSONB NOT NULL,
    "releaseNotes" TEXT,
    "releasedByUserId" TEXT NOT NULL,
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseClientDisclosureRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasePackageShare" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "lawyerUserId" TEXT,
    "publicCode" TEXT NOT NULL,
    "accessTokenHash" TEXT,
    "optionalPinHash" TEXT,
    "shareMode" "CasePackageShareMode" NOT NULL DEFAULT 'DESIGNATED_LAWYER',
    "status" "CasePackageShareStatus" NOT NULL DEFAULT 'ACTIVE',
    "allowSummary" BOOLEAN NOT NULL DEFAULT true,
    "allowInterview" BOOLEAN NOT NULL DEFAULT true,
    "allowAttachmentList" BOOLEAN NOT NULL DEFAULT true,
    "allowAttachmentDownload" BOOLEAN NOT NULL DEFAULT false,
    "allowDocumentDraft" BOOLEAN NOT NULL DEFAULT true,
    "allowDocumentPdf" BOOLEAN NOT NULL DEFAULT false,
    "allowPackagePdf" BOOLEAN NOT NULL DEFAULT false,
    "allowClientContact" BOOLEAN NOT NULL DEFAULT false,
    "allowOpponentDetail" BOOLEAN NOT NULL DEFAULT false,
    "consentText" TEXT NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokeReason" TEXT,
    "snapshotJson" JSONB,
    "snapshotSha256" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CasePackageShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasePackageAccessLog" (
    "id" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" "CasePackageAccessAction" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "resultMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CasePackageAccessLog_pkey" PRIMARY KEY ("id")
);

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
    "interviewQuestionKey" TEXT,
    "voiceTranscriptId" TEXT,
    "sourceMarker" TEXT,
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

-- CreateTable
CREATE TABLE "CaseAttachment" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "uploaderUserId" TEXT NOT NULL,
    "category" "CaseAttachmentCategory" NOT NULL DEFAULT 'OTHER',
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "status" "AttachmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CaseAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LitigationUploadedFile" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "uploaderUserId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "extractionStatus" "LitigationExtractionStatus" NOT NULL DEFAULT 'PENDING',
    "extractionQualityScore" DOUBLE PRECISION,
    "pageCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LitigationUploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LitigationDocumentAnalysis" (
    "id" TEXT NOT NULL,
    "uploadedFileId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "classificationRevision" INTEGER,
    "analysisStatus" "LitigationDocumentAnalysisStatus" NOT NULL,
    "documentType" TEXT NOT NULL,
    "analysisJson" JSONB NOT NULL,
    "errorMessage" TEXT,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitigationDocumentAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LitigationOpponentBriefAnalysis" (
    "id" TEXT NOT NULL,
    "uploadedFileId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "documentAnalysisRevision" INTEGER,
    "analysisStatus" "LitigationOpponentBriefAnalysisStatus" NOT NULL,
    "documentType" TEXT NOT NULL,
    "analysisJson" JSONB NOT NULL,
    "errorMessage" TEXT,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitigationOpponentBriefAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LitigationEvidenceMapping" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "mappingStatus" "LitigationEvidenceMappingStatus" NOT NULL,
    "mappingJson" JSONB NOT NULL,
    "errorMessage" TEXT,
    "mappedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitigationEvidenceMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LitigationEvidenceMappingItemReview" (
    "id" TEXT NOT NULL,
    "mappingId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemKind" TEXT NOT NULL,
    "reviewStatus" TEXT NOT NULL,
    "reviewedByUserId" TEXT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitigationEvidenceMappingItemReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LitigationDocumentIntelligenceReviewDecision" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "sourcePhase" "LitigationDocumentIntelligenceReviewPhase" NOT NULL,
    "sourceFileId" TEXT,
    "itemCategory" TEXT NOT NULL,
    "aiText" TEXT NOT NULL,
    "reviewStatus" TEXT NOT NULL,
    "editedText" TEXT,
    "rejectionReason" TEXT,
    "reviewNote" TEXT,
    "ledgerEntryJson" JSONB,
    "payloadJson" JSONB,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LitigationDocumentIntelligenceReviewDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LitigationDeadline" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "candidateDueText" TEXT,
    "dueAt" TIMESTAMP(3),
    "courtName" TEXT,
    "hearingKind" TEXT,
    "clientVisible" BOOLEAN NOT NULL DEFAULT true,
    "status" "LitigationDeadlineStatus" NOT NULL DEFAULT 'OPEN',
    "reviewDecisionId" TEXT,
    "sourceItemId" TEXT NOT NULL,
    "sourcePhase" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LitigationDeadline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LitigationDeadlineNotification" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "deadlineId" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "recipientRole" "UserRole" NOT NULL,
    "channel" "LitigationDeadlineNotificationChannel" NOT NULL,
    "reminderOffset" "LitigationDeadlineReminderOffset" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "LitigationDeadlineNotificationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "failureReason" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LitigationDeadlineNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientNotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kakaoOptIn" BOOLEAN NOT NULL DEFAULT false,
    "emailOptIn" BOOLEAN NOT NULL DEFAULT true,
    "smsOptIn" BOOLEAN NOT NULL DEFAULT false,
    "webPushOptIn" BOOLEAN NOT NULL DEFAULT false,
    "litigationDeadlineReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "documentShareNoticeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientNotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientPushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" VARCHAR(2000) NOT NULL,
    "p256dh" VARCHAR(500) NOT NULL,
    "auth" VARCHAR(500) NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientPushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "displayName" TEXT,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerSuccessActivity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "activityType" "CustomerSuccessActivityType" NOT NULL,
    "summary" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "riskSignal" TEXT,
    "nextActionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerSuccessActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantUsageEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "kind" "TenantUsageEventKind" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit" "TenantUsageEventUnit" NOT NULL DEFAULT 'COUNT',
    "caseId" TEXT,
    "metadata" JSONB,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantUsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingUsageLedger" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "meteringEventId" TEXT,
    "billingPeriodKey" TEXT NOT NULL,
    "chargeCategory" "BillingChargeCategory" NOT NULL,
    "billableQuantity" INTEGER NOT NULL,
    "unitCostSnapshot" JSONB NOT NULL,
    "planSnapshot" JSONB NOT NULL,
    "status" "BillingLedgerStatus" NOT NULL DEFAULT 'DRAFT',
    "adjustmentOfId" TEXT,
    "voidReason" TEXT,
    "adjustmentReason" TEXT,
    "actorUserId" TEXT,
    "postedAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingUsageLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingLedgerPeriodClose" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "billingPeriodKey" TEXT NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedByUserId" TEXT,

    CONSTRAINT "BillingLedgerPeriodClose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiEvaluationDatasetEntry" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "packType" "AiEvaluationCasePackType" NOT NULL,
    "feature" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "inputContext" JSONB NOT NULL,
    "expectedCriteria" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiEvaluationDatasetEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiLawyerReviewFeedback" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "lawyerUserId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "evaluationCode" TEXT,
    "aiOutputHash" TEXT NOT NULL,
    "rating" "AiLawyerReviewFeedbackRating" NOT NULL,
    "feedbackNotes" TEXT,
    "correctionHints" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiLawyerReviewFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tier" "TenantPlanTier" NOT NULL DEFAULT 'FREE',
    "status" "TenantPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "featureFlags" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantMembership" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TenantMembershipRole" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "TenantMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LitigationTask" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskKind" "LitigationTaskKind" NOT NULL,
    "status" "LitigationTaskStatus" NOT NULL DEFAULT 'OPEN',
    "reviewDecisionId" TEXT,
    "sourceItemId" TEXT NOT NULL,
    "sourcePhase" TEXT,
    "assigneeUserId" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LitigationTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LitigationDraftContext" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contextJson" JSONB NOT NULL,
    "reviewDecisionIds" JSONB NOT NULL,
    "status" "LitigationDraftContextStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LitigationDraftContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LitigationDocumentIntelligenceOpsSync" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "syncJson" JSONB NOT NULL,
    "syncedByUserId" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitigationDocumentIntelligenceOpsSync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LitigationDocumentIntelligenceOpsLink" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "reviewDecisionId" TEXT NOT NULL,
    "sourceItemId" TEXT NOT NULL,
    "targetType" "LitigationOpsLinkTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitigationDocumentIntelligenceOpsLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LitigationDocumentClassification" (
    "id" TEXT NOT NULL,
    "uploadedFileId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "classificationStatus" "LitigationClassificationStatus" NOT NULL,
    "documentType" TEXT NOT NULL,
    "sourceParty" "LitigationSourceParty" NOT NULL,
    "litigationStage" "LitigationStage" NOT NULL,
    "sensitivityLevel" "LitigationSensitivityLevel" NOT NULL,
    "analysisReadiness" "LitigationAnalysisReadiness" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "recommendedNextTasks" JSONB NOT NULL,
    "citationsJson" JSONB NOT NULL,
    "errorMessage" TEXT,
    "classifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitigationDocumentClassification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LitigationExtractedText" (
    "id" TEXT NOT NULL,
    "uploadedFileId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "extractionMethod" "LitigationExtractionMethod" NOT NULL,
    "pagesJson" JSONB NOT NULL,
    "qualityScore" DOUBLE PRECISION NOT NULL,
    "qualityFlags" JSONB NOT NULL DEFAULT '[]',
    "errorMessage" TEXT,
    "extractedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitigationExtractedText_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseTimelineMemo" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "memoType" "TimelineMemoType" NOT NULL DEFAULT 'USER_NOTE',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "alertEventId" TEXT,
    "noteType" TEXT,

    CONSTRAINT "CaseTimelineMemo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentParagraph" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "sectionTitle" TEXT,
    "label" TEXT,
    "content" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "included" BOOLEAN NOT NULL DEFAULT true,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "aiHint" TEXT,
    "sourceQuestionKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentParagraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentApprovalReview" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "reviewChecked" BOOLEAN NOT NULL DEFAULT false,
    "diffReviewed" BOOLEAN NOT NULL DEFAULT false,
    "checklistConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "reviewerUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentApprovalReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentParagraphVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "paragraphId" TEXT NOT NULL,
    "versionGroupId" TEXT NOT NULL,
    "sectionTitle" TEXT,
    "label" TEXT,
    "content" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "included" BOOLEAN NOT NULL DEFAULT true,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "aiHint" TEXT,
    "sourceQuestionKey" TEXT,
    "reason" TEXT,
    "actorUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentParagraphVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentParagraphRewriteHistory" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "documentId" TEXT,
    "paragraphId" TEXT NOT NULL,
    "sourceQuestionKey" TEXT,
    "templateType" TEXT NOT NULL,
    "title" TEXT,
    "beforeContent" TEXT NOT NULL,
    "afterContent" TEXT NOT NULL,
    "instruction" TEXT,
    "aiModel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCEEDED',
    "actorUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentParagraphRewriteHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseAssignment" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "assigneeUserId" TEXT NOT NULL,
    "assignedByUserId" TEXT NOT NULL,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "CaseAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawyerMatchingRecommendation" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "status" "LawyerMatchingRecommendationStatus" NOT NULL,
    "matchedSpecialties" JSONB NOT NULL,
    "excludedLawyersSnapshot" JSONB NOT NULL,
    "eligibleLawyerIds" JSONB NOT NULL,
    "recommendedAssignmentNote" TEXT NOT NULL,
    "generatedBy" "LawyerMatchingRecommendationGeneratedBy" NOT NULL DEFAULT 'RULE_ENGINE',
    "requiresHumanApproval" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "activeCaseKey" TEXT,
    "createdByAdminId" TEXT NOT NULL,
    "approvedByAdminId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedAssignmentId" TEXT,
    "rejectedByAdminId" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LawyerMatchingRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

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
    "slaHours" INTEGER,
    "dueSoonHours" INTEGER,
    "escalationLevel1Hours" INTEGER,
    "escalationLevel2Hours" INTEGER,
    "escalationLevel3Hours" INTEGER,
    "escalationTargetGroups" "AlertEscalationTargetGroup"[] DEFAULT ARRAY['ADMINS']::"AlertEscalationTargetGroup"[],
    "escalationUserIdsJson" JSONB,
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
    "assigneeUserId" TEXT,
    "dueAt" TIMESTAMP(3),
    "slaState" "AlertSlaState" NOT NULL DEFAULT 'ON_TRACK',
    "slaHours" INTEGER,
    "dueSoonHours" INTEGER,
    "escalationLevel" "AlertEscalationLevel" NOT NULL DEFAULT 'NONE',
    "boardOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AlertEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertEscalation" (
    "id" TEXT NOT NULL,
    "alertEventId" TEXT NOT NULL,
    "level" "AlertEscalationLevel" NOT NULL,
    "status" "AlertEscalationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "clearedAt" TIMESTAMP(3),
    "releaseReason" TEXT,
    "releasedByUserId" TEXT,

    CONSTRAINT "AlertEscalation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertSlaWarning" (
    "id" TEXT NOT NULL,
    "alertEventId" TEXT NOT NULL,
    "status" "AlertSlaWarningStatus" NOT NULL DEFAULT 'OPEN',
    "warningType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clearedAt" TIMESTAMP(3),

    CONSTRAINT "AlertSlaWarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminNotification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'ALERT_EVENT',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "targetHref" TEXT,
    "metaJson" JSONB,
    "userId" TEXT NOT NULL,
    "alertEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertBoardFilterPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT NOT NULL DEFAULT 'PRIVATE',
    "status" TEXT,
    "severity" TEXT,
    "ruleCode" TEXT,
    "escalationLevel" INTEGER,
    "assigneeUserId" TEXT,
    "dueFrom" TIMESTAMP(3),
    "dueTo" TIMESTAMP(3),
    "q" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertBoardFilterPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CronJobExecutionLog" (
    "id" TEXT NOT NULL,
    "jobCode" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "status" "CronJobStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "scannedCount" INTEGER,
    "affectedCount" INTEGER,
    "message" TEXT,
    "errorStack" TEXT,
    "metaJson" JSONB,
    "triggeredBy" TEXT,
    "retryOfRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CronJobExecutionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "questionSetId" TEXT,
    "questionSetCode" TEXT,
    "questionSetVersion" TEXT,
    "status" "InterviewStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "answersJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceTranscript" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "interviewId" TEXT,
    "status" "VoiceTranscriptStatus" NOT NULL DEFAULT 'CAPTURED',
    "draftText" TEXT,
    "storeOriginalAudio" BOOLEAN NOT NULL DEFAULT false,
    "originalAudioStorageKey" TEXT,
    "expiresAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceTranscript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceInteractionTrace" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "voiceTranscriptId" TEXT NOT NULL,
    "event" "VoiceInteractionTraceEvent" NOT NULL,
    "payloadJson" JSONB,
    "actorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceInteractionTrace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceLawyerReviewCompletion" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "voiceTranscriptId" TEXT NOT NULL,
    "reviewedByUserId" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceLawyerReviewCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoicePrivacyOpsRequest" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "voiceTranscriptId" TEXT,
    "requestType" "VoicePrivacyOpsRequestType" NOT NULL,
    "status" "VoicePrivacyOpsRequestStatus" NOT NULL DEFAULT 'OPEN',
    "requesterChannel" TEXT,
    "requesterNote" TEXT NOT NULL,
    "opsNotes" TEXT,
    "resolutionCode" "VoicePrivacyOpsResolutionCode",
    "evidenceTag" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "assignedToUserId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoicePrivacyOpsRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalKnowledgeDemandIntake" (
    "id" TEXT NOT NULL,
    "signalSource" TEXT NOT NULL,
    "observationWindowFrom" DATE NOT NULL,
    "observationWindowTo" DATE NOT NULL,
    "querySignature" JSONB NOT NULL,
    "questionType" JSONB NOT NULL,
    "caseTypeMapping" JSONB NOT NULL,
    "suggestedGongbuhoCode" TEXT,
    "demandStrength" TEXT NOT NULL,
    "intakeCompliance" JSONB NOT NULL,
    "status" "LegalKnowledgeIntakeStatus" NOT NULL DEFAULT 'DRAFT',
    "operatorNote" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalKnowledgeDemandIntake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalKnowledgeResearchBrief" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "demandKeywordSnapshot" TEXT NOT NULL,
    "targetCaseType" TEXT NOT NULL,
    "packetIntent" "LegalKnowledgePacketIntent" NOT NULL,
    "targetGongbuhoCode" TEXT,
    "canonicalSourceRefs" JSONB NOT NULL,
    "legalIssueOutline" TEXT NOT NULL,
    "structureHints" JSONB NOT NULL,
    "researchCompliance" JSONB NOT NULL,
    "status" "LegalKnowledgeResearchBriefStatus" NOT NULL DEFAULT 'DRAFT',
    "preparedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalKnowledgeResearchBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalKnowledgeLawyerReviewDecision" (
    "id" TEXT NOT NULL,
    "researchBriefId" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "decision" "LegalKnowledgeLawyerReviewDecisionType" NOT NULL,
    "reviewerAttestation" JSONB NOT NULL,
    "reviewNotes" TEXT NOT NULL,
    "highRiskFlags" JSONB,
    "rejectionReasonCode" TEXT,
    "status" "LegalKnowledgeLawyerReviewStatus" NOT NULL DEFAULT 'PENDING',
    "gongbuhoPacketId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalKnowledgeLawyerReviewDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AibeopchinCmbConfigRevision" (
    "id" TEXT NOT NULL,
    "caseType" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "AibeopchinCmbConfigStatus" NOT NULL DEFAULT 'DRAFT',
    "configJson" JSONB NOT NULL,
    "evidenceTag" TEXT NOT NULL,
    "changeReason" TEXT,
    "verifyPassedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AibeopchinCmbConfigRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AibeopchinCmbPublishEvent" (
    "id" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "fromStatus" "AibeopchinCmbConfigStatus" NOT NULL,
    "toStatus" "AibeopchinCmbConfigStatus" NOT NULL,
    "evidenceTag" TEXT NOT NULL,
    "changeReason" TEXT,
    "verifyPassed" BOOLEAN NOT NULL DEFAULT false,
    "actorUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AibeopchinCmbPublishEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GongbuhoPacket" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "caseType" TEXT,
    "status" "GongbuhoPacketStatus" NOT NULL DEFAULT 'DRAFT',
    "packetJson" JSONB NOT NULL,
    "createdByUserId" TEXT,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GongbuhoPacket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GongbuhoTrace" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "gongbuhoPacketId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "inputSnapshot" JSONB,
    "outputSnapshot" JSONB,
    "validationResult" JSONB,
    "riskFlags" JSONB,
    "expertReviewPoints" JSONB,
    "humanApprovalStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GongbuhoTrace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IllegalLendingReport" (
    "id" TEXT NOT NULL,
    "reporterType" "IllegalLendingReporterType" NOT NULL,
    "reporterName" TEXT NOT NULL,
    "reporterPhone" TEXT NOT NULL,
    "reporterEmail" TEXT,
    "uploadToken" TEXT,
    "victimName" TEXT,
    "victimPhone" TEXT,
    "creditorName" TEXT,
    "creditorPhone" TEXT,
    "creditorBusinessName" TEXT,
    "creditorAccount" TEXT,
    "creditorMemo" TEXT,
    "loanDate" TIMESTAMP(3),
    "principalAmount" INTEGER,
    "receivedAmount" INTEGER,
    "repaidAmount" INTEGER,
    "demandedAmount" INTEGER,
    "interestRateMemo" TEXT,
    "damageTypes" "IllegalLendingDamageType"[],
    "collectionMethods" TEXT,
    "damageSummary" TEXT NOT NULL,
    "requestedHelp" TEXT,
    "evidenceSummary" TEXT,
    "generatedReport" TEXT NOT NULL,
    "consentPrivacy" BOOLEAN NOT NULL DEFAULT false,
    "consentNoLegalAdvice" BOOLEAN NOT NULL DEFAULT false,
    "status" "IllegalLendingReportStatus" NOT NULL DEFAULT 'DRAFT_SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IllegalLendingReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IllegalLendingReportStatusHistory" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "fromStatus" "IllegalLendingReportStatus",
    "toStatus" "IllegalLendingReportStatus" NOT NULL,
    "reason" TEXT,
    "actorId" TEXT,
    "actorName" TEXT,
    "actorRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IllegalLendingReportStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IllegalLendingReportAccessLog" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT,
    "actorRole" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IllegalLendingReportAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IllegalLendingReportAttachment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "attachmentType" "IllegalLendingAttachmentType" NOT NULL DEFAULT 'OTHER',
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageProvider" TEXT NOT NULL DEFAULT 'local',
    "storageKey" TEXT,
    "storagePath" TEXT NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastDownloadedAt" TIMESTAMP(3),
    "memo" TEXT,
    "uploadedByName" TEXT,
    "uploadedByPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IllegalLendingReportAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IllegalLendingLawyerReviewRequest" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "status" "IllegalLendingLawyerReviewStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestedById" TEXT,
    "requestedByName" TEXT,
    "requestedByRole" TEXT,
    "memo" TEXT,
    "assignedLawyerId" TEXT,
    "assignedLawyerName" TEXT,
    "autoAssigned" BOOLEAN NOT NULL DEFAULT false,
    "assignmentReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IllegalLendingLawyerReviewRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IllegalLendingLawyerAssignmentHistory" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "reviewRequestId" TEXT,
    "lawyerId" TEXT,
    "lawyerName" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IllegalLendingLawyerAssignmentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JeonseDamageReport" (
    "id" TEXT NOT NULL,
    "reporterType" "JeonseReporterType" NOT NULL,
    "reporterName" TEXT NOT NULL,
    "reporterPhone" TEXT NOT NULL,
    "reporterEmail" TEXT,
    "tenantName" TEXT,
    "tenantPhone" TEXT,
    "propertyAddress" TEXT NOT NULL,
    "propertyType" TEXT,
    "moveInDate" TIMESTAMP(3),
    "fixedDate" TIMESTAMP(3),
    "hasMoveInReport" BOOLEAN NOT NULL DEFAULT false,
    "hasFixedDate" BOOLEAN NOT NULL DEFAULT false,
    "hasPossession" BOOLEAN NOT NULL DEFAULT false,
    "hasLeaseRegistration" BOOLEAN NOT NULL DEFAULT false,
    "hasJeonseRight" BOOLEAN NOT NULL DEFAULT false,
    "leaseStartDate" TIMESTAMP(3),
    "leaseEndDate" TIMESTAMP(3),
    "depositAmount" INTEGER,
    "monthlyRentAmount" INTEGER,
    "contractMemo" TEXT,
    "landlordName" TEXT,
    "landlordPhone" TEXT,
    "landlordAddress" TEXT,
    "landlordMemo" TEXT,
    "brokerName" TEXT,
    "brokerOfficeName" TEXT,
    "brokerPhone" TEXT,
    "brokerMemo" TEXT,
    "damageTypes" "JeonseDamageType"[],
    "returnRequestHistory" TEXT,
    "auctionOrSaleStatus" TEXT,
    "investigationStatus" TEXT,
    "damageSummary" TEXT NOT NULL,
    "requestedHelp" TEXT,
    "evidenceSummary" TEXT,
    "generatedSummary" TEXT NOT NULL,
    "generatedChecklist" TEXT NOT NULL,
    "consentPrivacy" BOOLEAN NOT NULL DEFAULT false,
    "consentNoLegalAdvice" BOOLEAN NOT NULL DEFAULT false,
    "uploadToken" TEXT,
    "status" "JeonseReportStatus" NOT NULL DEFAULT 'DRAFT_SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JeonseDamageReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JeonseDamageReportStatusHistory" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "fromStatus" "JeonseReportStatus",
    "toStatus" "JeonseReportStatus" NOT NULL,
    "reason" TEXT,
    "actorId" TEXT,
    "actorName" TEXT,
    "actorRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JeonseDamageReportStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JeonseDamageReportAccessLog" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT,
    "actorRole" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JeonseDamageReportAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JeonseDamageReportAttachment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "attachmentType" "JeonseDamageAttachmentType" NOT NULL DEFAULT 'OTHER',
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageProvider" TEXT NOT NULL DEFAULT 'local',
    "storageKey" TEXT,
    "storagePath" TEXT NOT NULL,
    "memo" TEXT,
    "uploadedByName" TEXT,
    "uploadedByPhone" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastDownloadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JeonseDamageReportAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JeonseDamageLawyerReviewRequest" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "status" "JeonseDamageLawyerReviewStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestedById" TEXT,
    "requestedByName" TEXT,
    "requestedByRole" TEXT,
    "memo" TEXT,
    "assignedLawyerId" TEXT,
    "assignedLawyerName" TEXT,
    "autoAssigned" BOOLEAN NOT NULL DEFAULT false,
    "assignmentReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JeonseDamageLawyerReviewRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WageClaimReport" (
    "id" TEXT NOT NULL,
    "reporterType" "WageClaimReporterType" NOT NULL,
    "reporterName" TEXT NOT NULL,
    "reporterPhone" TEXT NOT NULL,
    "reporterEmail" TEXT,
    "workerName" TEXT,
    "workerPhone" TEXT,
    "employerName" TEXT,
    "companyName" TEXT NOT NULL,
    "companyAddress" TEXT,
    "companyPhone" TEXT,
    "workplaceAddress" TEXT,
    "employmentType" "WageClaimEmploymentType" NOT NULL,
    "jobDescription" TEXT,
    "hireDate" TIMESTAMP(3),
    "resignationDate" TIMESTAMP(3),
    "isResigned" BOOLEAN NOT NULL DEFAULT false,
    "monthlyWageAmount" INTEGER,
    "dailyWageAmount" INTEGER,
    "hourlyWageAmount" INTEGER,
    "agreedPayMemo" TEXT,
    "unpaidWageAmount" INTEGER,
    "unpaidSeveranceAmount" INTEGER,
    "unpaidAllowanceAmount" INTEGER,
    "unpaidTotalAmount" INTEGER,
    "unpaidPeriod" TEXT,
    "paymentDueDate" TIMESTAMP(3),
    "damageTypes" "WageClaimDamageType"[],
    "requestHistory" TEXT,
    "evidenceSummary" TEXT,
    "damageSummary" TEXT NOT NULL,
    "requestedHelp" TEXT,
    "generatedStatement" TEXT NOT NULL,
    "generatedTable" TEXT NOT NULL,
    "generatedChecklist" TEXT NOT NULL,
    "consentPrivacy" BOOLEAN NOT NULL DEFAULT false,
    "consentNoLegalAdvice" BOOLEAN NOT NULL DEFAULT false,
    "uploadToken" TEXT,
    "status" "WageClaimReportStatus" NOT NULL DEFAULT 'DRAFT_SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WageClaimReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalDocument" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" "LegalDocumentType" NOT NULL,
    "status" "LegalDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "questionSetVersion" TEXT,
    "templateCode" TEXT,
    "templateVersion" TEXT,
    "latestApprovedAt" TIMESTAMP(3),
    "latestApprovedById" TEXT,
    "lockedAt" TIMESTAMP(3),
    "lockedById" TEXT,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalDocumentParagraph" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "paragraphKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "status" "LegalParagraphStatus" NOT NULL DEFAULT 'DRAFT',
    "generationMode" TEXT NOT NULL,
    "aiPromptKey" TEXT,
    "lockOnApproval" BOOLEAN NOT NULL DEFAULT true,
    "supportsRegeneration" BOOLEAN NOT NULL DEFAULT true,
    "supportsRestore" BOOLEAN NOT NULL DEFAULT true,
    "lockedAt" TIMESTAMP(3),
    "lockedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalDocumentParagraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalDocumentParagraphHistory" (
    "id" TEXT NOT NULL,
    "paragraphId" TEXT NOT NULL,
    "versionNo" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "beforeContent" TEXT,
    "afterContent" TEXT,
    "actorUserId" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalDocumentParagraphHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalDocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "versionNo" INTEGER NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalDocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentGenerationTrace" (
    "id" TEXT NOT NULL,
    "legalDocumentId" TEXT NOT NULL,
    "templateCode" TEXT NOT NULL,
    "templateVersion" TEXT NOT NULL,
    "templateTitle" TEXT NOT NULL,
    "sourceProvider" "LegalFormProvider" NOT NULL,
    "sourceId" TEXT,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "sourceHash" TEXT,
    "sourceStatus" "LegalFormSourceStatus",
    "sourceNote" TEXT,
    "generatedSnapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedSnapshotAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentGenerationTrace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseTimelineEvent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metaJson" JSONB,
    "actorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseTimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "questions" JSONB NOT NULL DEFAULT '[]',
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "catalogStatus" "QuestionSetStatus" NOT NULL DEFAULT 'DRAFT',
    "supportedDocumentTypes" JSONB NOT NULL DEFAULT '[]',
    "visibleToRoles" JSONB NOT NULL DEFAULT '[]',
    "definitionJson" JSONB,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalFormSource" (
    "id" TEXT NOT NULL,
    "provider" "LegalFormProvider" NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "category" TEXT,
    "officialFormCode" TEXT,
    "fileName" TEXT,
    "fileMimeType" TEXT,
    "fileHash" TEXT,
    "storageKey" TEXT,
    "licenseNote" TEXT,
    "downloadedAt" TIMESTAMP(3),
    "effectiveDate" TIMESTAMP(3),
    "parsedText" TEXT,
    "status" "LegalFormSourceStatus" NOT NULL DEFAULT 'ACTIVE',
    "memo" TEXT,
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalFormSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "type" "LegalDocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "definitionJson" JSONB NOT NULL,
    "sourceId" TEXT,
    "sourceProvider" "LegalFormProvider" NOT NULL DEFAULT 'INTERNAL_STANDARD',
    "sourceUrl" TEXT,
    "sourceHash" TEXT,
    "sourceNote" TEXT,
    "catalogStatus" "QuestionSetStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseClientPortalAccess" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "invitedByUserId" TEXT,
    "accessStatus" "CaseClientPortalAccessStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastAccessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseClientPortalAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientSubmission" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "supplementRequestId" TEXT,
    "submittedByUserId" TEXT NOT NULL,
    "reviewedByUserId" TEXT,
    "kind" "ClientSubmissionKind" NOT NULL DEFAULT 'SUPPLEMENT',
    "status" "ClientSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "message" TEXT,
    "reviewMemo" TEXT,
    "submittedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientSubmissionFile" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "uploadedFileId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "fileType" TEXT,
    "description" TEXT,
    "sharedWithLawyer" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientSubmissionFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseConversationThread" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "threadType" "CaseConversationThreadType" NOT NULL DEFAULT 'GENERAL',
    "supplementRequestId" TEXT,
    "title" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseConversationThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseConversationMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "senderRole" "UserRole" NOT NULL,
    "body" TEXT NOT NULL,
    "attachmentIds" JSONB,
    "readByJson" JSONB,
    "isPinnedForRecord" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseSharedDocument" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "sharedByUserId" TEXT NOT NULL,
    "sharedWithClientUserId" TEXT NOT NULL,
    "shareStatus" "CaseSharedDocumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "firstViewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseSharedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseDocumentDelivery" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "sharedDocumentId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "recipientClientUserId" TEXT NOT NULL,
    "deliveryChannel" "CaseDocumentDeliveryChannel" NOT NULL,
    "deliveryStatus" "CaseDocumentDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "secureLinkTokenHash" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseDocumentDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalMessageLog" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "deliveryId" TEXT,
    "channel" "CaseDocumentDeliveryChannel" NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'STUB',
    "templateCode" TEXT,
    "payloadSummaryJson" JSONB NOT NULL,
    "status" "ExternalMessageStatus" NOT NULL DEFAULT 'PENDING',
    "failureReason" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalMessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseMessageAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "uploadedFileId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseMessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetryJob" (
    "id" TEXT NOT NULL,
    "sourceType" "RetryJobSourceType" NOT NULL,
    "sourceRefId" TEXT,
    "jobCode" TEXT NOT NULL,
    "caseId" TEXT,
    "status" "RetryJobStatus" NOT NULL DEFAULT 'FAILED',
    "safetyClass" "RetryJobSafetyClass" NOT NULL DEFAULT 'OPERATOR_APPROVAL',
    "retryable" BOOLEAN NOT NULL DEFAULT false,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "failureReason" TEXT,
    "failurePayload" JSONB,
    "lastAttemptAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolvedByUserId" TEXT,
    "operatorNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetryJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentPipelineJob" (
    "id" TEXT NOT NULL,
    "uploadedFileId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "failedStage" "DocumentPipelineStage" NOT NULL,
    "resumeFromStage" "DocumentPipelineStage" NOT NULL,
    "status" "DocumentPipelineJobStatus" NOT NULL DEFAULT 'FAILED',
    "failureReason" TEXT,
    "failurePayload" JSONB,
    "completedStagesJson" JSONB,
    "lawyerReviewLocked" BOOLEAN NOT NULL DEFAULT false,
    "clientDisclosureLocked" BOOLEAN NOT NULL DEFAULT false,
    "duplicateGuardKey" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "resolvedAt" TIMESTAMP(3),
    "resolvedByUserId" TEXT,
    "operatorNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentPipelineJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalReliabilityActionCandidate" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "tenantId" TEXT,
    "sourcePhase" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "riskType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "lawyerFacingTitle" TEXT NOT NULL,
    "lawyerFacingReason" TEXT NOT NULL,
    "proposedClientRequestTitle" TEXT NOT NULL,
    "proposedClientRequestBody" TEXT NOT NULL,
    "clientVisibleByDefault" BOOLEAN NOT NULL DEFAULT false,
    "prohibitedClientTextRemoved" BOOLEAN NOT NULL DEFAULT true,
    "requiresLawyerApproval" BOOLEAN NOT NULL DEFAULT true,
    "linkedClaimIds" JSONB NOT NULL,
    "linkedEvidenceIds" JSONB NOT NULL,
    "linkedJudgmentIds" JSONB NOT NULL,
    "supplementRequestId" TEXT,
    "createdByUserId" TEXT,
    "approvedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalReliabilityActionCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalReliabilityActionDecisionLedger" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "tenantId" TEXT,
    "actionCandidateId" TEXT NOT NULL,
    "decisionType" TEXT NOT NULL,
    "decidedByUserId" TEXT NOT NULL,
    "decidedByRole" TEXT NOT NULL,
    "beforeClientRequestBody" TEXT,
    "afterClientRequestBody" TEXT,
    "rejectionReason" TEXT,
    "deferReason" TEXT,
    "sourceRiskRadarSignalId" TEXT,
    "linkedClaimIds" JSONB NOT NULL,
    "linkedEvidenceIds" JSONB NOT NULL,
    "linkedJudgmentIds" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalReliabilityActionDecisionLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalReliabilityActionOperation" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "tenantId" TEXT,
    "sourcePhase" TEXT NOT NULL,
    "sourceActionCandidateId" TEXT NOT NULL,
    "supplementRequestId" TEXT,
    "operationType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "assignedToUserId" TEXT,
    "assignedByUserId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "slaStatus" TEXT NOT NULL DEFAULT 'NO_DUE_DATE',
    "slaCheckedAt" TIMESTAMP(3),
    "clientResponseReceivedAt" TIMESTAMP(3),
    "clientResponseSummary" TEXT,
    "lawyerReviewedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "linkedClientSubmissionIds" JSONB NOT NULL DEFAULT '[]',
    "linkedUploadedFileIds" JSONB NOT NULL DEFAULT '[]',
    "linkedEvidenceIntakeIds" JSONB NOT NULL DEFAULT '[]',
    "evidenceIntakeStatus" TEXT NOT NULL DEFAULT 'NONE',
    "reviewHandoffJson" JSONB,
    "completionResult" TEXT,
    "lawyerFacingTitle" TEXT NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalReliabilityActionOperation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LawyerProfile_userId_key" ON "LawyerProfile"("userId");

-- CreateIndex
CREATE INDEX "LawyerProfile_verificationStatus_idx" ON "LawyerProfile"("verificationStatus");

-- CreateIndex
CREATE INDEX "LawyerProfile_reviewedById_idx" ON "LawyerProfile"("reviewedById");

-- CreateIndex
CREATE INDEX "LawyerProfile_signupRiskIpFingerprint_idx" ON "LawyerProfile"("signupRiskIpFingerprint");

-- CreateIndex
CREATE INDEX "LawyerVerificationDocument_lawyerProfileId_idx" ON "LawyerVerificationDocument"("lawyerProfileId");

-- CreateIndex
CREATE INDEX "LawyerVerificationDocument_storageKey_idx" ON "LawyerVerificationDocument"("storageKey");

-- CreateIndex
CREATE INDEX "AuthAccount_userId_idx" ON "AuthAccount"("userId");

-- CreateIndex
CREATE INDEX "AuthAccount_email_idx" ON "AuthAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthAccount_provider_providerAccountId_key" ON "AuthAccount"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "BulkActionJob_status_createdAt_idx" ON "BulkActionJob"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BulkActionJob_status_priority_createdAt_idx" ON "BulkActionJob"("status", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "BulkActionJob_queueGroup_status_priority_createdAt_idx" ON "BulkActionJob"("queueGroup", "status", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "BulkActionJob_concurrencyKey_status_priority_createdAt_idx" ON "BulkActionJob"("concurrencyKey", "status", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "BulkActionJob_actorId_createdAt_idx" ON "BulkActionJob"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "BulkActionJob_retryOfJobId_idx" ON "BulkActionJob"("retryOfJobId");

-- CreateIndex
CREATE INDEX "BulkActionJob_lockExpiresAt_idx" ON "BulkActionJob"("lockExpiresAt");

-- CreateIndex
CREATE INDEX "BulkActionJob_lastHeartbeatAt_idx" ON "BulkActionJob"("lastHeartbeatAt");

-- CreateIndex
CREATE INDEX "BulkActionJob_retryScheduledAt_idx" ON "BulkActionJob"("retryScheduledAt");

-- CreateIndex
CREATE INDEX "BulkActionJobItem_jobId_status_idx" ON "BulkActionJobItem"("jobId", "status");

-- CreateIndex
CREATE INDEX "BulkActionJobItem_jobId_failureCategory_idx" ON "BulkActionJobItem"("jobId", "failureCategory");

-- CreateIndex
CREATE INDEX "BulkActionJobItem_jobId_failureTaxonomyCode_idx" ON "BulkActionJobItem"("jobId", "failureTaxonomyCode");

-- CreateIndex
CREATE INDEX "BulkActionJobItem_targetType_targetId_idx" ON "BulkActionJobItem"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "BulkActionSchedule_dedupeKey_key" ON "BulkActionSchedule"("dedupeKey");

-- CreateIndex
CREATE INDEX "BulkActionSchedule_status_scheduledFor_idx" ON "BulkActionSchedule"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "BulkActionSchedule_sourceJobId_taxonomy_idx" ON "BulkActionSchedule"("sourceJobId", "taxonomy");

-- CreateIndex
CREATE UNIQUE INDEX "OpsQueueTicket_dedupeKey_key" ON "OpsQueueTicket"("dedupeKey");

-- CreateIndex
CREATE INDEX "OpsQueueTicket_status_dueAt_idx" ON "OpsQueueTicket"("status", "dueAt");

-- CreateIndex
CREATE INDEX "OpsQueueTicket_assigneeUserId_status_idx" ON "OpsQueueTicket"("assigneeUserId", "status");

-- CreateIndex
CREATE INDEX "OpsQueueTicket_boardColumn_boardOrder_idx" ON "OpsQueueTicket"("boardColumn", "boardOrder");

-- CreateIndex
CREATE INDEX "OpsQueueTicket_retryScheduledAt_idx" ON "OpsQueueTicket"("retryScheduledAt");

-- CreateIndex
CREATE INDEX "OpsQueueTicket_overdueNotifiedAt_idx" ON "OpsQueueTicket"("overdueNotifiedAt");

-- CreateIndex
CREATE INDEX "OpsQueueTicket_status_createdAt_idx" ON "OpsQueueTicket"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OpsQueueTicket_sourceJobId_taxonomy_idx" ON "OpsQueueTicket"("sourceJobId", "taxonomy");

-- CreateIndex
CREATE INDEX "TimelineExportLog_requestedById_createdAt_idx" ON "TimelineExportLog"("requestedById", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OpsQueueSetting_key_key" ON "OpsQueueSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerHeartbeat_workerKey_key" ON "WorkerHeartbeat"("workerKey");

-- CreateIndex
CREATE INDEX "WorkerHeartbeat_workerType_lastHeartbeatAt_idx" ON "WorkerHeartbeat"("workerType", "lastHeartbeatAt");

-- CreateIndex
CREATE INDEX "WorkerHeartbeat_status_lastHeartbeatAt_idx" ON "WorkerHeartbeat"("status", "lastHeartbeatAt");

-- CreateIndex
CREATE INDEX "Case_ownerUserId_status_createdAt_idx" ON "Case"("ownerUserId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Case_tenantId_status_createdAt_idx" ON "Case"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Case_status_createdAt_idx" ON "Case"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Case_questionSetId_idx" ON "Case"("questionSetId");

-- CreateIndex
CREATE INDEX "Case_assignedLawyerUserId_idx" ON "Case"("assignedLawyerUserId");

-- CreateIndex
CREATE INDEX "Case_assignedStaffUserId_idx" ON "Case"("assignedStaffUserId");

-- CreateIndex
CREATE INDEX "CaseIntelligenceSnapshot_caseId_createdAt_idx" ON "CaseIntelligenceSnapshot"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "CaseClientDisclosureRelease_caseId_releasedAt_idx" ON "CaseClientDisclosureRelease"("caseId", "releasedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CasePackageShare_publicCode_key" ON "CasePackageShare"("publicCode");

-- CreateIndex
CREATE INDEX "CasePackageShare_caseId_status_idx" ON "CasePackageShare"("caseId", "status");

-- CreateIndex
CREATE INDEX "CasePackageShare_ownerUserId_createdAt_idx" ON "CasePackageShare"("ownerUserId", "createdAt");

-- CreateIndex
CREATE INDEX "CasePackageShare_lawyerUserId_createdAt_idx" ON "CasePackageShare"("lawyerUserId", "createdAt");

-- CreateIndex
CREATE INDEX "CasePackageShare_publicCode_idx" ON "CasePackageShare"("publicCode");

-- CreateIndex
CREATE INDEX "CasePackageAccessLog_shareId_createdAt_idx" ON "CasePackageAccessLog"("shareId", "createdAt");

-- CreateIndex
CREATE INDEX "CasePackageAccessLog_caseId_createdAt_idx" ON "CasePackageAccessLog"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "CasePackageAccessLog_actorUserId_createdAt_idx" ON "CasePackageAccessLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "CasePackageAccessLog_action_createdAt_idx" ON "CasePackageAccessLog"("action", "createdAt");

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

-- CreateIndex
CREATE INDEX "CaseAttachment_caseId_status_createdAt_idx" ON "CaseAttachment"("caseId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "CaseAttachment_uploaderUserId_createdAt_idx" ON "CaseAttachment"("uploaderUserId", "createdAt");

-- CreateIndex
CREATE INDEX "LitigationUploadedFile_caseId_createdAt_idx" ON "LitigationUploadedFile"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "LitigationUploadedFile_caseId_extractionStatus_idx" ON "LitigationUploadedFile"("caseId", "extractionStatus");

-- CreateIndex
CREATE INDEX "LitigationDocumentAnalysis_uploadedFileId_analyzedAt_idx" ON "LitigationDocumentAnalysis"("uploadedFileId", "analyzedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LitigationDocumentAnalysis_uploadedFileId_revision_key" ON "LitigationDocumentAnalysis"("uploadedFileId", "revision");

-- CreateIndex
CREATE INDEX "LitigationOpponentBriefAnalysis_uploadedFileId_analyzedAt_idx" ON "LitigationOpponentBriefAnalysis"("uploadedFileId", "analyzedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LitigationOpponentBriefAnalysis_uploadedFileId_revision_key" ON "LitigationOpponentBriefAnalysis"("uploadedFileId", "revision");

-- CreateIndex
CREATE INDEX "LitigationEvidenceMapping_caseId_mappedAt_idx" ON "LitigationEvidenceMapping"("caseId", "mappedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LitigationEvidenceMapping_caseId_revision_key" ON "LitigationEvidenceMapping"("caseId", "revision");

-- CreateIndex
CREATE INDEX "LitigationEvidenceMappingItemReview_mappingId_itemKind_idx" ON "LitigationEvidenceMappingItemReview"("mappingId", "itemKind");

-- CreateIndex
CREATE UNIQUE INDEX "LitigationEvidenceMappingItemReview_mappingId_itemId_key" ON "LitigationEvidenceMappingItemReview"("mappingId", "itemId");

-- CreateIndex
CREATE INDEX "LitigationDocumentIntelligenceReviewDecision_caseId_reviewS_idx" ON "LitigationDocumentIntelligenceReviewDecision"("caseId", "reviewStatus");

-- CreateIndex
CREATE INDEX "LitigationDocumentIntelligenceReviewDecision_caseId_sourceP_idx" ON "LitigationDocumentIntelligenceReviewDecision"("caseId", "sourcePhase");

-- CreateIndex
CREATE UNIQUE INDEX "LitigationDocumentIntelligenceReviewDecision_caseId_itemId_key" ON "LitigationDocumentIntelligenceReviewDecision"("caseId", "itemId");

-- CreateIndex
CREATE INDEX "LitigationDeadline_caseId_status_idx" ON "LitigationDeadline"("caseId", "status");

-- CreateIndex
CREATE INDEX "LitigationDeadline_caseId_dueAt_idx" ON "LitigationDeadline"("caseId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "LitigationDeadline_caseId_sourceItemId_key" ON "LitigationDeadline"("caseId", "sourceItemId");

-- CreateIndex
CREATE INDEX "LitigationDeadlineNotification_caseId_scheduledAt_idx" ON "LitigationDeadlineNotification"("caseId", "scheduledAt");

-- CreateIndex
CREATE INDEX "LitigationDeadlineNotification_deadlineId_status_idx" ON "LitigationDeadlineNotification"("deadlineId", "status");

-- CreateIndex
CREATE INDEX "LitigationDeadlineNotification_recipientUserId_status_idx" ON "LitigationDeadlineNotification"("recipientUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LitigationDeadlineNotification_deadlineId_recipientUserId_c_key" ON "LitigationDeadlineNotification"("deadlineId", "recipientUserId", "channel", "reminderOffset");

-- CreateIndex
CREATE UNIQUE INDEX "ClientNotificationPreference_userId_key" ON "ClientNotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientPushSubscription_endpoint_key" ON "ClientPushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "ClientPushSubscription_userId_idx" ON "ClientPushSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- CreateIndex
CREATE INDEX "CustomerSuccessActivity_tenantId_createdAt_idx" ON "CustomerSuccessActivity"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "CustomerSuccessActivity_tenantId_activityType_idx" ON "CustomerSuccessActivity"("tenantId", "activityType");

-- CreateIndex
CREATE INDEX "TenantUsageEvent_tenantId_periodKey_kind_idx" ON "TenantUsageEvent"("tenantId", "periodKey", "kind");

-- CreateIndex
CREATE INDEX "TenantUsageEvent_tenantId_caseId_kind_periodKey_idx" ON "TenantUsageEvent"("tenantId", "caseId", "kind", "periodKey");

-- CreateIndex
CREATE INDEX "TenantUsageEvent_tenantId_recordedAt_idx" ON "TenantUsageEvent"("tenantId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BillingUsageLedger_meteringEventId_key" ON "BillingUsageLedger"("meteringEventId");

-- CreateIndex
CREATE INDEX "BillingUsageLedger_tenantId_billingPeriodKey_status_idx" ON "BillingUsageLedger"("tenantId", "billingPeriodKey", "status");

-- CreateIndex
CREATE INDEX "BillingUsageLedger_tenantId_chargeCategory_billingPeriodKey_idx" ON "BillingUsageLedger"("tenantId", "chargeCategory", "billingPeriodKey");

-- CreateIndex
CREATE UNIQUE INDEX "BillingLedgerPeriodClose_tenantId_billingPeriodKey_key" ON "BillingLedgerPeriodClose"("tenantId", "billingPeriodKey");

-- CreateIndex
CREATE UNIQUE INDEX "AiEvaluationDatasetEntry_code_key" ON "AiEvaluationDatasetEntry"("code");

-- CreateIndex
CREATE INDEX "AiEvaluationDatasetEntry_packType_feature_isActive_idx" ON "AiEvaluationDatasetEntry"("packType", "feature", "isActive");

-- CreateIndex
CREATE INDEX "AiLawyerReviewFeedback_caseId_feature_createdAt_idx" ON "AiLawyerReviewFeedback"("caseId", "feature", "createdAt");

-- CreateIndex
CREATE INDEX "AiLawyerReviewFeedback_lawyerUserId_createdAt_idx" ON "AiLawyerReviewFeedback"("lawyerUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AiLawyerReviewFeedback_evaluationCode_idx" ON "AiLawyerReviewFeedback"("evaluationCode");

-- CreateIndex
CREATE UNIQUE INDEX "TenantPlan_tenantId_key" ON "TenantPlan"("tenantId");

-- CreateIndex
CREATE INDEX "TenantPlan_tier_status_idx" ON "TenantPlan"("tier", "status");

-- CreateIndex
CREATE INDEX "TenantMembership_userId_isActive_idx" ON "TenantMembership"("userId", "isActive");

-- CreateIndex
CREATE INDEX "TenantMembership_tenantId_role_isActive_idx" ON "TenantMembership"("tenantId", "role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TenantMembership_tenantId_userId_key" ON "TenantMembership"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "LitigationTask_caseId_status_idx" ON "LitigationTask"("caseId", "status");

-- CreateIndex
CREATE INDEX "LitigationTask_assigneeUserId_status_idx" ON "LitigationTask"("assigneeUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LitigationTask_caseId_sourceItemId_key" ON "LitigationTask"("caseId", "sourceItemId");

-- CreateIndex
CREATE INDEX "LitigationDraftContext_caseId_status_idx" ON "LitigationDraftContext"("caseId", "status");

-- CreateIndex
CREATE INDEX "LitigationDocumentIntelligenceOpsSync_caseId_syncedAt_idx" ON "LitigationDocumentIntelligenceOpsSync"("caseId", "syncedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LitigationDocumentIntelligenceOpsSync_caseId_revision_key" ON "LitigationDocumentIntelligenceOpsSync"("caseId", "revision");

-- CreateIndex
CREATE INDEX "LitigationDocumentIntelligenceOpsLink_caseId_reviewDecision_idx" ON "LitigationDocumentIntelligenceOpsLink"("caseId", "reviewDecisionId");

-- CreateIndex
CREATE UNIQUE INDEX "LitigationDocumentIntelligenceOpsLink_caseId_sourceItemId_t_key" ON "LitigationDocumentIntelligenceOpsLink"("caseId", "sourceItemId", "targetType");

-- CreateIndex
CREATE INDEX "LitigationDocumentClassification_uploadedFileId_classifiedA_idx" ON "LitigationDocumentClassification"("uploadedFileId", "classifiedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LitigationDocumentClassification_uploadedFileId_revision_key" ON "LitigationDocumentClassification"("uploadedFileId", "revision");

-- CreateIndex
CREATE INDEX "LitigationExtractedText_uploadedFileId_extractedAt_idx" ON "LitigationExtractedText"("uploadedFileId", "extractedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LitigationExtractedText_uploadedFileId_revision_key" ON "LitigationExtractedText"("uploadedFileId", "revision");

-- CreateIndex
CREATE INDEX "CaseTimelineMemo_caseId_createdAt_idx" ON "CaseTimelineMemo"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "CaseTimelineMemo_authorUserId_createdAt_idx" ON "CaseTimelineMemo"("authorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "CaseTimelineMemo_alertEventId_idx" ON "CaseTimelineMemo"("alertEventId");

-- CreateIndex
CREATE INDEX "CaseTimelineMemo_noteType_idx" ON "CaseTimelineMemo"("noteType");

-- CreateIndex
CREATE INDEX "DocumentParagraph_documentId_orderIndex_idx" ON "DocumentParagraph"("documentId", "orderIndex");

-- CreateIndex
CREATE INDEX "DocumentParagraph_caseId_documentId_idx" ON "DocumentParagraph"("caseId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentApprovalReview_documentId_key" ON "DocumentApprovalReview"("documentId");

-- CreateIndex
CREATE INDEX "DocumentApprovalReview_caseId_documentId_idx" ON "DocumentApprovalReview"("caseId", "documentId");

-- CreateIndex
CREATE INDEX "DocumentParagraphVersion_documentId_versionGroupId_idx" ON "DocumentParagraphVersion"("documentId", "versionGroupId");

-- CreateIndex
CREATE INDEX "DocumentParagraphVersion_paragraphId_createdAt_idx" ON "DocumentParagraphVersion"("paragraphId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentParagraphVersion_caseId_documentId_idx" ON "DocumentParagraphVersion"("caseId", "documentId");

-- CreateIndex
CREATE INDEX "DocumentParagraphRewriteHistory_caseId_paragraphId_createdA_idx" ON "DocumentParagraphRewriteHistory"("caseId", "paragraphId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentParagraphRewriteHistory_documentId_createdAt_idx" ON "DocumentParagraphRewriteHistory"("documentId", "createdAt");

-- CreateIndex
CREATE INDEX "CaseAssignment_caseId_isActive_createdAt_idx" ON "CaseAssignment"("caseId", "isActive", "createdAt");

-- CreateIndex
CREATE INDEX "CaseAssignment_assigneeUserId_isActive_createdAt_idx" ON "CaseAssignment"("assigneeUserId", "isActive", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LawyerMatchingRecommendation_activeCaseKey_key" ON "LawyerMatchingRecommendation"("activeCaseKey");

-- CreateIndex
CREATE UNIQUE INDEX "LawyerMatchingRecommendation_approvedAssignmentId_key" ON "LawyerMatchingRecommendation"("approvedAssignmentId");

-- CreateIndex
CREATE INDEX "LawyerMatchingRecommendation_caseId_status_createdAt_idx" ON "LawyerMatchingRecommendation"("caseId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "LawyerMatchingRecommendation_createdByAdminId_createdAt_idx" ON "LawyerMatchingRecommendation"("createdByAdminId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

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
CREATE INDEX "AlertEvent_assigneeUserId_status_idx" ON "AlertEvent"("assigneeUserId", "status");

-- CreateIndex
CREATE INDEX "AlertEvent_dueAt_status_idx" ON "AlertEvent"("dueAt", "status");

-- CreateIndex
CREATE INDEX "AlertEvent_slaState_status_idx" ON "AlertEvent"("slaState", "status");

-- CreateIndex
CREATE INDEX "AlertEvent_status_escalationLevel_idx" ON "AlertEvent"("status", "escalationLevel");

-- CreateIndex
CREATE INDEX "AlertEvent_status_boardOrder_idx" ON "AlertEvent"("status", "boardOrder");

-- CreateIndex
CREATE INDEX "AlertEscalation_status_createdAt_idx" ON "AlertEscalation"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AlertEscalation_alertEventId_level_status_key" ON "AlertEscalation"("alertEventId", "level", "status");

-- CreateIndex
CREATE INDEX "AlertSlaWarning_status_createdAt_idx" ON "AlertSlaWarning"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AlertSlaWarning_warningType_createdAt_idx" ON "AlertSlaWarning"("warningType", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AlertSlaWarning_alertEventId_warningType_status_key" ON "AlertSlaWarning"("alertEventId", "warningType", "status");

-- CreateIndex
CREATE INDEX "AdminNotification_userId_readAt_createdAt_idx" ON "AdminNotification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "AdminNotification_alertEventId_idx" ON "AdminNotification"("alertEventId");

-- CreateIndex
CREATE INDEX "AlertBoardFilterPreset_userId_createdAt_idx" ON "AlertBoardFilterPreset"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AlertBoardFilterPreset_userId_name_key" ON "AlertBoardFilterPreset"("userId", "name");

-- CreateIndex
CREATE INDEX "CronJobExecutionLog_jobCode_createdAt_idx" ON "CronJobExecutionLog"("jobCode", "createdAt");

-- CreateIndex
CREATE INDEX "CronJobExecutionLog_status_createdAt_idx" ON "CronJobExecutionLog"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Interview_caseId_status_idx" ON "Interview"("caseId", "status");

-- CreateIndex
CREATE INDEX "VoiceTranscript_caseId_questionKey_status_idx" ON "VoiceTranscript"("caseId", "questionKey", "status");

-- CreateIndex
CREATE INDEX "VoiceTranscript_caseId_status_expiresAt_idx" ON "VoiceTranscript"("caseId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "VoiceInteractionTrace_caseId_idx" ON "VoiceInteractionTrace"("caseId");

-- CreateIndex
CREATE INDEX "VoiceInteractionTrace_voiceTranscriptId_createdAt_idx" ON "VoiceInteractionTrace"("voiceTranscriptId", "createdAt");

-- CreateIndex
CREATE INDEX "VoiceLawyerReviewCompletion_caseId_idx" ON "VoiceLawyerReviewCompletion"("caseId");

-- CreateIndex
CREATE INDEX "VoiceLawyerReviewCompletion_voiceTranscriptId_idx" ON "VoiceLawyerReviewCompletion"("voiceTranscriptId");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceLawyerReviewCompletion_caseId_questionKey_key" ON "VoiceLawyerReviewCompletion"("caseId", "questionKey");

-- CreateIndex
CREATE INDEX "VoicePrivacyOpsRequest_status_createdAt_idx" ON "VoicePrivacyOpsRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "VoicePrivacyOpsRequest_caseId_idx" ON "VoicePrivacyOpsRequest"("caseId");

-- CreateIndex
CREATE INDEX "VoicePrivacyOpsRequest_voiceTranscriptId_idx" ON "VoicePrivacyOpsRequest"("voiceTranscriptId");

-- CreateIndex
CREATE INDEX "LegalKnowledgeDemandIntake_status_idx" ON "LegalKnowledgeDemandIntake"("status");

-- CreateIndex
CREATE INDEX "LegalKnowledgeDemandIntake_createdByUserId_idx" ON "LegalKnowledgeDemandIntake"("createdByUserId");

-- CreateIndex
CREATE INDEX "LegalKnowledgeResearchBrief_intakeId_idx" ON "LegalKnowledgeResearchBrief"("intakeId");

-- CreateIndex
CREATE INDEX "LegalKnowledgeResearchBrief_status_idx" ON "LegalKnowledgeResearchBrief"("status");

-- CreateIndex
CREATE INDEX "LegalKnowledgeResearchBrief_preparedByUserId_idx" ON "LegalKnowledgeResearchBrief"("preparedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "LegalKnowledgeLawyerReviewDecision_gongbuhoPacketId_key" ON "LegalKnowledgeLawyerReviewDecision"("gongbuhoPacketId");

-- CreateIndex
CREATE INDEX "LegalKnowledgeLawyerReviewDecision_researchBriefId_idx" ON "LegalKnowledgeLawyerReviewDecision"("researchBriefId");

-- CreateIndex
CREATE INDEX "LegalKnowledgeLawyerReviewDecision_intakeId_idx" ON "LegalKnowledgeLawyerReviewDecision"("intakeId");

-- CreateIndex
CREATE INDEX "AibeopchinCmbConfigRevision_caseType_status_idx" ON "AibeopchinCmbConfigRevision"("caseType", "status");

-- CreateIndex
CREATE INDEX "AibeopchinCmbConfigRevision_configId_idx" ON "AibeopchinCmbConfigRevision"("configId");

-- CreateIndex
CREATE UNIQUE INDEX "AibeopchinCmbConfigRevision_caseType_version_key" ON "AibeopchinCmbConfigRevision"("caseType", "version");

-- CreateIndex
CREATE INDEX "AibeopchinCmbPublishEvent_revisionId_createdAt_idx" ON "AibeopchinCmbPublishEvent"("revisionId", "createdAt");

-- CreateIndex
CREATE INDEX "AibeopchinCmbPublishEvent_actorUserId_createdAt_idx" ON "AibeopchinCmbPublishEvent"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "GongbuhoPacket_code_idx" ON "GongbuhoPacket"("code");

-- CreateIndex
CREATE INDEX "GongbuhoPacket_caseType_idx" ON "GongbuhoPacket"("caseType");

-- CreateIndex
CREATE INDEX "GongbuhoPacket_status_idx" ON "GongbuhoPacket"("status");

-- CreateIndex
CREATE INDEX "GongbuhoPacket_createdByUserId_idx" ON "GongbuhoPacket"("createdByUserId");

-- CreateIndex
CREATE INDEX "GongbuhoPacket_approvedByUserId_idx" ON "GongbuhoPacket"("approvedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "GongbuhoPacket_code_version_key" ON "GongbuhoPacket"("code", "version");

-- CreateIndex
CREATE INDEX "GongbuhoTrace_caseId_idx" ON "GongbuhoTrace"("caseId");

-- CreateIndex
CREATE INDEX "GongbuhoTrace_code_version_idx" ON "GongbuhoTrace"("code", "version");

-- CreateIndex
CREATE INDEX "GongbuhoTrace_gongbuhoPacketId_idx" ON "GongbuhoTrace"("gongbuhoPacketId");

-- CreateIndex
CREATE UNIQUE INDEX "IllegalLendingReport_uploadToken_key" ON "IllegalLendingReport"("uploadToken");

-- CreateIndex
CREATE INDEX "IllegalLendingReport_createdAt_idx" ON "IllegalLendingReport"("createdAt");

-- CreateIndex
CREATE INDEX "IllegalLendingReport_status_idx" ON "IllegalLendingReport"("status");

-- CreateIndex
CREATE INDEX "IllegalLendingReport_reporterPhone_idx" ON "IllegalLendingReport"("reporterPhone");

-- CreateIndex
CREATE INDEX "IllegalLendingReportStatusHistory_reportId_idx" ON "IllegalLendingReportStatusHistory"("reportId");

-- CreateIndex
CREATE INDEX "IllegalLendingReportStatusHistory_createdAt_idx" ON "IllegalLendingReportStatusHistory"("createdAt");

-- CreateIndex
CREATE INDEX "IllegalLendingReportStatusHistory_toStatus_idx" ON "IllegalLendingReportStatusHistory"("toStatus");

-- CreateIndex
CREATE INDEX "IllegalLendingReportAccessLog_reportId_idx" ON "IllegalLendingReportAccessLog"("reportId");

-- CreateIndex
CREATE INDEX "IllegalLendingReportAccessLog_action_idx" ON "IllegalLendingReportAccessLog"("action");

-- CreateIndex
CREATE INDEX "IllegalLendingReportAccessLog_createdAt_idx" ON "IllegalLendingReportAccessLog"("createdAt");

-- CreateIndex
CREATE INDEX "IllegalLendingReportAttachment_reportId_idx" ON "IllegalLendingReportAttachment"("reportId");

-- CreateIndex
CREATE INDEX "IllegalLendingReportAttachment_attachmentType_idx" ON "IllegalLendingReportAttachment"("attachmentType");

-- CreateIndex
CREATE INDEX "IllegalLendingReportAttachment_createdAt_idx" ON "IllegalLendingReportAttachment"("createdAt");

-- CreateIndex
CREATE INDEX "IllegalLendingLawyerReviewRequest_reportId_idx" ON "IllegalLendingLawyerReviewRequest"("reportId");

-- CreateIndex
CREATE INDEX "IllegalLendingLawyerReviewRequest_status_idx" ON "IllegalLendingLawyerReviewRequest"("status");

-- CreateIndex
CREATE INDEX "IllegalLendingLawyerReviewRequest_createdAt_idx" ON "IllegalLendingLawyerReviewRequest"("createdAt");

-- CreateIndex
CREATE INDEX "IllegalLendingLawyerAssignmentHistory_reportId_idx" ON "IllegalLendingLawyerAssignmentHistory"("reportId");

-- CreateIndex
CREATE INDEX "IllegalLendingLawyerAssignmentHistory_lawyerId_idx" ON "IllegalLendingLawyerAssignmentHistory"("lawyerId");

-- CreateIndex
CREATE INDEX "IllegalLendingLawyerAssignmentHistory_createdAt_idx" ON "IllegalLendingLawyerAssignmentHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "JeonseDamageReport_uploadToken_key" ON "JeonseDamageReport"("uploadToken");

-- CreateIndex
CREATE INDEX "JeonseDamageReport_createdAt_idx" ON "JeonseDamageReport"("createdAt");

-- CreateIndex
CREATE INDEX "JeonseDamageReport_status_idx" ON "JeonseDamageReport"("status");

-- CreateIndex
CREATE INDEX "JeonseDamageReport_reporterPhone_idx" ON "JeonseDamageReport"("reporterPhone");

-- CreateIndex
CREATE INDEX "JeonseDamageReport_propertyAddress_idx" ON "JeonseDamageReport"("propertyAddress");

-- CreateIndex
CREATE INDEX "JeonseDamageReportStatusHistory_reportId_idx" ON "JeonseDamageReportStatusHistory"("reportId");

-- CreateIndex
CREATE INDEX "JeonseDamageReportStatusHistory_createdAt_idx" ON "JeonseDamageReportStatusHistory"("createdAt");

-- CreateIndex
CREATE INDEX "JeonseDamageReportStatusHistory_toStatus_idx" ON "JeonseDamageReportStatusHistory"("toStatus");

-- CreateIndex
CREATE INDEX "JeonseDamageReportAccessLog_reportId_idx" ON "JeonseDamageReportAccessLog"("reportId");

-- CreateIndex
CREATE INDEX "JeonseDamageReportAccessLog_action_idx" ON "JeonseDamageReportAccessLog"("action");

-- CreateIndex
CREATE INDEX "JeonseDamageReportAccessLog_createdAt_idx" ON "JeonseDamageReportAccessLog"("createdAt");

-- CreateIndex
CREATE INDEX "JeonseDamageReportAttachment_reportId_idx" ON "JeonseDamageReportAttachment"("reportId");

-- CreateIndex
CREATE INDEX "JeonseDamageReportAttachment_attachmentType_idx" ON "JeonseDamageReportAttachment"("attachmentType");

-- CreateIndex
CREATE INDEX "JeonseDamageReportAttachment_createdAt_idx" ON "JeonseDamageReportAttachment"("createdAt");

-- CreateIndex
CREATE INDEX "JeonseDamageLawyerReviewRequest_reportId_idx" ON "JeonseDamageLawyerReviewRequest"("reportId");

-- CreateIndex
CREATE INDEX "JeonseDamageLawyerReviewRequest_status_idx" ON "JeonseDamageLawyerReviewRequest"("status");

-- CreateIndex
CREATE INDEX "JeonseDamageLawyerReviewRequest_createdAt_idx" ON "JeonseDamageLawyerReviewRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WageClaimReport_uploadToken_key" ON "WageClaimReport"("uploadToken");

-- CreateIndex
CREATE INDEX "WageClaimReport_createdAt_idx" ON "WageClaimReport"("createdAt");

-- CreateIndex
CREATE INDEX "WageClaimReport_status_idx" ON "WageClaimReport"("status");

-- CreateIndex
CREATE INDEX "WageClaimReport_reporterPhone_idx" ON "WageClaimReport"("reporterPhone");

-- CreateIndex
CREATE INDEX "WageClaimReport_companyName_idx" ON "WageClaimReport"("companyName");

-- CreateIndex
CREATE INDEX "LegalDocument_caseId_type_idx" ON "LegalDocument"("caseId", "type");

-- CreateIndex
CREATE INDEX "LegalDocument_status_idx" ON "LegalDocument"("status");

-- CreateIndex
CREATE INDEX "LegalDocumentParagraph_documentId_displayOrder_idx" ON "LegalDocumentParagraph"("documentId", "displayOrder");

-- CreateIndex
CREATE INDEX "LegalDocumentParagraph_status_idx" ON "LegalDocumentParagraph"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LegalDocumentParagraph_documentId_sectionKey_paragraphKey_key" ON "LegalDocumentParagraph"("documentId", "sectionKey", "paragraphKey");

-- CreateIndex
CREATE INDEX "LegalDocumentParagraphHistory_paragraphId_versionNo_idx" ON "LegalDocumentParagraphHistory"("paragraphId", "versionNo");

-- CreateIndex
CREATE INDEX "LegalDocumentVersion_documentId_approved_idx" ON "LegalDocumentVersion"("documentId", "approved");

-- CreateIndex
CREATE UNIQUE INDEX "LegalDocumentVersion_documentId_versionNo_key" ON "LegalDocumentVersion"("documentId", "versionNo");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentGenerationTrace_legalDocumentId_key" ON "DocumentGenerationTrace"("legalDocumentId");

-- CreateIndex
CREATE INDEX "DocumentGenerationTrace_sourceProvider_idx" ON "DocumentGenerationTrace"("sourceProvider");

-- CreateIndex
CREATE INDEX "DocumentGenerationTrace_sourceId_idx" ON "DocumentGenerationTrace"("sourceId");

-- CreateIndex
CREATE INDEX "DocumentGenerationTrace_generatedSnapshotAt_idx" ON "DocumentGenerationTrace"("generatedSnapshotAt");

-- CreateIndex
CREATE INDEX "DocumentGenerationTrace_approvedSnapshotAt_idx" ON "DocumentGenerationTrace"("approvedSnapshotAt");

-- CreateIndex
CREATE INDEX "CaseTimelineEvent_caseId_createdAt_idx" ON "CaseTimelineEvent"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "QuestionSet_isActive_updatedAt_idx" ON "QuestionSet"("isActive", "updatedAt");

-- CreateIndex
CREATE INDEX "QuestionSet_createdAt_idx" ON "QuestionSet"("createdAt");

-- CreateIndex
CREATE INDEX "QuestionSet_catalogStatus_idx" ON "QuestionSet"("catalogStatus");

-- CreateIndex
CREATE INDEX "LegalFormSource_provider_status_idx" ON "LegalFormSource"("provider", "status");

-- CreateIndex
CREATE INDEX "LegalFormSource_documentType_status_idx" ON "LegalFormSource"("documentType", "status");

-- CreateIndex
CREATE INDEX "LegalFormSource_sourceName_idx" ON "LegalFormSource"("sourceName");

-- CreateIndex
CREATE INDEX "LegalFormSource_fileHash_idx" ON "LegalFormSource"("fileHash");

-- CreateIndex
CREATE INDEX "LegalFormSource_createdAt_idx" ON "LegalFormSource"("createdAt");

-- CreateIndex
CREATE INDEX "DocumentTemplate_type_idx" ON "DocumentTemplate"("type");

-- CreateIndex
CREATE INDEX "DocumentTemplate_catalogStatus_idx" ON "DocumentTemplate"("catalogStatus");

-- CreateIndex
CREATE INDEX "DocumentTemplate_sourceId_idx" ON "DocumentTemplate"("sourceId");

-- CreateIndex
CREATE INDEX "DocumentTemplate_sourceProvider_idx" ON "DocumentTemplate"("sourceProvider");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTemplate_code_version_key" ON "DocumentTemplate"("code", "version");

-- CreateIndex
CREATE INDEX "CaseClientPortalAccess_clientUserId_accessStatus_idx" ON "CaseClientPortalAccess"("clientUserId", "accessStatus");

-- CreateIndex
CREATE UNIQUE INDEX "CaseClientPortalAccess_caseId_clientUserId_key" ON "CaseClientPortalAccess"("caseId", "clientUserId");

-- CreateIndex
CREATE INDEX "ClientSubmission_caseId_status_createdAt_idx" ON "ClientSubmission"("caseId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ClientSubmission_supplementRequestId_status_idx" ON "ClientSubmission"("supplementRequestId", "status");

-- CreateIndex
CREATE INDEX "ClientSubmission_submittedByUserId_createdAt_idx" ON "ClientSubmission"("submittedByUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientSubmissionFile_submissionId_createdAt_idx" ON "ClientSubmissionFile"("submissionId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientSubmissionFile_uploadedFileId_idx" ON "ClientSubmissionFile"("uploadedFileId");

-- CreateIndex
CREATE INDEX "CaseConversationThread_caseId_lastMessageAt_idx" ON "CaseConversationThread"("caseId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "CaseConversationThread_supplementRequestId_idx" ON "CaseConversationThread"("supplementRequestId");

-- CreateIndex
CREATE INDEX "CaseConversationMessage_threadId_createdAt_idx" ON "CaseConversationMessage"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "CaseConversationMessage_caseId_createdAt_idx" ON "CaseConversationMessage"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "CaseConversationMessage_senderUserId_createdAt_idx" ON "CaseConversationMessage"("senderUserId", "createdAt");

-- CreateIndex
CREATE INDEX "CaseSharedDocument_caseId_shareStatus_sharedAt_idx" ON "CaseSharedDocument"("caseId", "shareStatus", "sharedAt");

-- CreateIndex
CREATE INDEX "CaseSharedDocument_sharedWithClientUserId_shareStatus_idx" ON "CaseSharedDocument"("sharedWithClientUserId", "shareStatus");

-- CreateIndex
CREATE INDEX "CaseDocumentDelivery_caseId_deliveryStatus_idx" ON "CaseDocumentDelivery"("caseId", "deliveryStatus");

-- CreateIndex
CREATE INDEX "CaseDocumentDelivery_sharedDocumentId_deliveryChannel_idx" ON "CaseDocumentDelivery"("sharedDocumentId", "deliveryChannel");

-- CreateIndex
CREATE INDEX "CaseDocumentDelivery_recipientClientUserId_deliveryStatus_idx" ON "CaseDocumentDelivery"("recipientClientUserId", "deliveryStatus");

-- CreateIndex
CREATE INDEX "ExternalMessageLog_caseId_channel_status_idx" ON "ExternalMessageLog"("caseId", "channel", "status");

-- CreateIndex
CREATE INDEX "ExternalMessageLog_recipientUserId_createdAt_idx" ON "ExternalMessageLog"("recipientUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ExternalMessageLog_deliveryId_idx" ON "ExternalMessageLog"("deliveryId");

-- CreateIndex
CREATE INDEX "CaseMessageAttachment_messageId_createdAt_idx" ON "CaseMessageAttachment"("messageId", "createdAt");

-- CreateIndex
CREATE INDEX "CaseMessageAttachment_uploadedFileId_idx" ON "CaseMessageAttachment"("uploadedFileId");

-- CreateIndex
CREATE INDEX "RetryJob_status_createdAt_idx" ON "RetryJob"("status", "createdAt");

-- CreateIndex
CREATE INDEX "RetryJob_caseId_createdAt_idx" ON "RetryJob"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "RetryJob_jobCode_status_idx" ON "RetryJob"("jobCode", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RetryJob_sourceType_sourceRefId_key" ON "RetryJob"("sourceType", "sourceRefId");

-- CreateIndex
CREATE INDEX "DocumentPipelineJob_uploadedFileId_failedStage_idx" ON "DocumentPipelineJob"("uploadedFileId", "failedStage");

-- CreateIndex
CREATE INDEX "DocumentPipelineJob_caseId_status_createdAt_idx" ON "DocumentPipelineJob"("caseId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentPipelineJob_status_createdAt_idx" ON "DocumentPipelineJob"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentPipelineJob_duplicateGuardKey_key" ON "DocumentPipelineJob"("duplicateGuardKey");

-- CreateIndex
CREATE INDEX "LegalReliabilityActionCandidate_caseId_status_createdAt_idx" ON "LegalReliabilityActionCandidate"("caseId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "LegalReliabilityActionCandidate_sourceId_caseId_idx" ON "LegalReliabilityActionCandidate"("sourceId", "caseId");

-- CreateIndex
CREATE INDEX "LegalReliabilityActionCandidate_supplementRequestId_idx" ON "LegalReliabilityActionCandidate"("supplementRequestId");

-- CreateIndex
CREATE INDEX "LegalReliabilityActionDecisionLedger_caseId_createdAt_idx" ON "LegalReliabilityActionDecisionLedger"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "LegalReliabilityActionDecisionLedger_actionCandidateId_crea_idx" ON "LegalReliabilityActionDecisionLedger"("actionCandidateId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LegalReliabilityActionOperation_sourceActionCandidateId_key" ON "LegalReliabilityActionOperation"("sourceActionCandidateId");

-- CreateIndex
CREATE INDEX "LegalReliabilityActionOperation_caseId_status_createdAt_idx" ON "LegalReliabilityActionOperation"("caseId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "LegalReliabilityActionOperation_supplementRequestId_idx" ON "LegalReliabilityActionOperation"("supplementRequestId");

-- CreateIndex
CREATE INDEX "LegalReliabilityActionOperation_assignedToUserId_idx" ON "LegalReliabilityActionOperation"("assignedToUserId");

-- CreateIndex
CREATE INDEX "LegalReliabilityActionOperation_slaStatus_idx" ON "LegalReliabilityActionOperation"("slaStatus");

-- AddForeignKey
ALTER TABLE "LawyerProfile" ADD CONSTRAINT "LawyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerProfile" ADD CONSTRAINT "LawyerProfile_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerVerificationDocument" ADD CONSTRAINT "LawyerVerificationDocument_lawyerProfileId_fkey" FOREIGN KEY ("lawyerProfileId") REFERENCES "LawyerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthAccount" ADD CONSTRAINT "AuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkActionJob" ADD CONSTRAINT "BulkActionJob_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkActionJob" ADD CONSTRAINT "BulkActionJob_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkActionJob" ADD CONSTRAINT "BulkActionJob_retryOfJobId_fkey" FOREIGN KEY ("retryOfJobId") REFERENCES "BulkActionJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkActionJobItem" ADD CONSTRAINT "BulkActionJobItem_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "BulkActionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkActionSchedule" ADD CONSTRAINT "BulkActionSchedule_sourceJobId_fkey" FOREIGN KEY ("sourceJobId") REFERENCES "BulkActionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsQueueTicket" ADD CONSTRAINT "OpsQueueTicket_sourceJobId_fkey" FOREIGN KEY ("sourceJobId") REFERENCES "BulkActionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsQueueTicket" ADD CONSTRAINT "OpsQueueTicket_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsQueueTicket" ADD CONSTRAINT "OpsQueueTicket_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineExportLog" ADD CONSTRAINT "TimelineExportLog_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES "QuestionSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseIntelligenceSnapshot" ADD CONSTRAINT "CaseIntelligenceSnapshot_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseIntelligenceSnapshot" ADD CONSTRAINT "CaseIntelligenceSnapshot_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseClientDisclosureRelease" ADD CONSTRAINT "CaseClientDisclosureRelease_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseClientDisclosureRelease" ADD CONSTRAINT "CaseClientDisclosureRelease_releasedByUserId_fkey" FOREIGN KEY ("releasedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasePackageShare" ADD CONSTRAINT "CasePackageShare_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasePackageShare" ADD CONSTRAINT "CasePackageShare_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasePackageShare" ADD CONSTRAINT "CasePackageShare_lawyerUserId_fkey" FOREIGN KEY ("lawyerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasePackageAccessLog" ADD CONSTRAINT "CasePackageAccessLog_shareId_fkey" FOREIGN KEY ("shareId") REFERENCES "CasePackageShare"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasePackageAccessLog" ADD CONSTRAINT "CasePackageAccessLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "CaseAttachment" ADD CONSTRAINT "CaseAttachment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAttachment" ADD CONSTRAINT "CaseAttachment_uploaderUserId_fkey" FOREIGN KEY ("uploaderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationUploadedFile" ADD CONSTRAINT "LitigationUploadedFile_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationUploadedFile" ADD CONSTRAINT "LitigationUploadedFile_uploaderUserId_fkey" FOREIGN KEY ("uploaderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationDocumentAnalysis" ADD CONSTRAINT "LitigationDocumentAnalysis_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "LitigationUploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationOpponentBriefAnalysis" ADD CONSTRAINT "LitigationOpponentBriefAnalysis_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "LitigationUploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationEvidenceMapping" ADD CONSTRAINT "LitigationEvidenceMapping_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationEvidenceMappingItemReview" ADD CONSTRAINT "LitigationEvidenceMappingItemReview_mappingId_fkey" FOREIGN KEY ("mappingId") REFERENCES "LitigationEvidenceMapping"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationEvidenceMappingItemReview" ADD CONSTRAINT "LitigationEvidenceMappingItemReview_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationDocumentIntelligenceReviewDecision" ADD CONSTRAINT "LitigationDocumentIntelligenceReviewDecision_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationDocumentIntelligenceReviewDecision" ADD CONSTRAINT "LitigationDocumentIntelligenceReviewDecision_reviewedByUse_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationDeadline" ADD CONSTRAINT "LitigationDeadline_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationDeadline" ADD CONSTRAINT "LitigationDeadline_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationDeadlineNotification" ADD CONSTRAINT "LitigationDeadlineNotification_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationDeadlineNotification" ADD CONSTRAINT "LitigationDeadlineNotification_deadlineId_fkey" FOREIGN KEY ("deadlineId") REFERENCES "LitigationDeadline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationDeadlineNotification" ADD CONSTRAINT "LitigationDeadlineNotification_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationDeadlineNotification" ADD CONSTRAINT "LitigationDeadlineNotification_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientNotificationPreference" ADD CONSTRAINT "ClientNotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPushSubscription" ADD CONSTRAINT "ClientPushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerSuccessActivity" ADD CONSTRAINT "CustomerSuccessActivity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUsageEvent" ADD CONSTRAINT "TenantUsageEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingUsageLedger" ADD CONSTRAINT "BillingUsageLedger_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingUsageLedger" ADD CONSTRAINT "BillingUsageLedger_meteringEventId_fkey" FOREIGN KEY ("meteringEventId") REFERENCES "TenantUsageEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingUsageLedger" ADD CONSTRAINT "BillingUsageLedger_adjustmentOfId_fkey" FOREIGN KEY ("adjustmentOfId") REFERENCES "BillingUsageLedger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingLedgerPeriodClose" ADD CONSTRAINT "BillingLedgerPeriodClose_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiLawyerReviewFeedback" ADD CONSTRAINT "AiLawyerReviewFeedback_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiLawyerReviewFeedback" ADD CONSTRAINT "AiLawyerReviewFeedback_lawyerUserId_fkey" FOREIGN KEY ("lawyerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantPlan" ADD CONSTRAINT "TenantPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationTask" ADD CONSTRAINT "LitigationTask_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationTask" ADD CONSTRAINT "LitigationTask_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationTask" ADD CONSTRAINT "LitigationTask_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationDraftContext" ADD CONSTRAINT "LitigationDraftContext_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationDraftContext" ADD CONSTRAINT "LitigationDraftContext_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationDocumentIntelligenceOpsSync" ADD CONSTRAINT "LitigationDocumentIntelligenceOpsSync_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationDocumentIntelligenceOpsSync" ADD CONSTRAINT "LitigationDocumentIntelligenceOpsSync_syncedByUserId_fkey" FOREIGN KEY ("syncedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationDocumentIntelligenceOpsLink" ADD CONSTRAINT "LitigationDocumentIntelligenceOpsLink_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationDocumentClassification" ADD CONSTRAINT "LitigationDocumentClassification_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "LitigationUploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LitigationExtractedText" ADD CONSTRAINT "LitigationExtractedText_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "LitigationUploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTimelineMemo" ADD CONSTRAINT "CaseTimelineMemo_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTimelineMemo" ADD CONSTRAINT "CaseTimelineMemo_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTimelineMemo" ADD CONSTRAINT "CaseTimelineMemo_alertEventId_fkey" FOREIGN KEY ("alertEventId") REFERENCES "AlertEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentParagraph" ADD CONSTRAINT "DocumentParagraph_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "CaseTimelineMemo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentParagraph" ADD CONSTRAINT "DocumentParagraph_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentApprovalReview" ADD CONSTRAINT "DocumentApprovalReview_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "CaseTimelineMemo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentApprovalReview" ADD CONSTRAINT "DocumentApprovalReview_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentParagraphVersion" ADD CONSTRAINT "DocumentParagraphVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "CaseTimelineMemo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentParagraphVersion" ADD CONSTRAINT "DocumentParagraphVersion_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentParagraphVersion" ADD CONSTRAINT "DocumentParagraphVersion_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentParagraphRewriteHistory" ADD CONSTRAINT "DocumentParagraphRewriteHistory_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentParagraphRewriteHistory" ADD CONSTRAINT "DocumentParagraphRewriteHistory_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAssignment" ADD CONSTRAINT "CaseAssignment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAssignment" ADD CONSTRAINT "CaseAssignment_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAssignment" ADD CONSTRAINT "CaseAssignment_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerMatchingRecommendation" ADD CONSTRAINT "LawyerMatchingRecommendation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerMatchingRecommendation" ADD CONSTRAINT "LawyerMatchingRecommendation_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerMatchingRecommendation" ADD CONSTRAINT "LawyerMatchingRecommendation_approvedByAdminId_fkey" FOREIGN KEY ("approvedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerMatchingRecommendation" ADD CONSTRAINT "LawyerMatchingRecommendation_rejectedByAdminId_fkey" FOREIGN KEY ("rejectedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerMatchingRecommendation" ADD CONSTRAINT "LawyerMatchingRecommendation_approvedAssignmentId_fkey" FOREIGN KEY ("approvedAssignmentId") REFERENCES "CaseAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "AlertRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_ignoredById_fkey" FOREIGN KEY ("ignoredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEscalation" ADD CONSTRAINT "AlertEscalation_alertEventId_fkey" FOREIGN KEY ("alertEventId") REFERENCES "AlertEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEscalation" ADD CONSTRAINT "AlertEscalation_releasedByUserId_fkey" FOREIGN KEY ("releasedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertSlaWarning" ADD CONSTRAINT "AlertSlaWarning_alertEventId_fkey" FOREIGN KEY ("alertEventId") REFERENCES "AlertEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminNotification" ADD CONSTRAINT "AdminNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminNotification" ADD CONSTRAINT "AdminNotification_alertEventId_fkey" FOREIGN KEY ("alertEventId") REFERENCES "AlertEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertBoardFilterPreset" ADD CONSTRAINT "AlertBoardFilterPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceTranscript" ADD CONSTRAINT "VoiceTranscript_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceTranscript" ADD CONSTRAINT "VoiceTranscript_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceTranscript" ADD CONSTRAINT "VoiceTranscript_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceInteractionTrace" ADD CONSTRAINT "VoiceInteractionTrace_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceInteractionTrace" ADD CONSTRAINT "VoiceInteractionTrace_voiceTranscriptId_fkey" FOREIGN KEY ("voiceTranscriptId") REFERENCES "VoiceTranscript"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceInteractionTrace" ADD CONSTRAINT "VoiceInteractionTrace_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceLawyerReviewCompletion" ADD CONSTRAINT "VoiceLawyerReviewCompletion_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceLawyerReviewCompletion" ADD CONSTRAINT "VoiceLawyerReviewCompletion_voiceTranscriptId_fkey" FOREIGN KEY ("voiceTranscriptId") REFERENCES "VoiceTranscript"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceLawyerReviewCompletion" ADD CONSTRAINT "VoiceLawyerReviewCompletion_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoicePrivacyOpsRequest" ADD CONSTRAINT "VoicePrivacyOpsRequest_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoicePrivacyOpsRequest" ADD CONSTRAINT "VoicePrivacyOpsRequest_voiceTranscriptId_fkey" FOREIGN KEY ("voiceTranscriptId") REFERENCES "VoiceTranscript"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoicePrivacyOpsRequest" ADD CONSTRAINT "VoicePrivacyOpsRequest_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoicePrivacyOpsRequest" ADD CONSTRAINT "VoicePrivacyOpsRequest_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoicePrivacyOpsRequest" ADD CONSTRAINT "VoicePrivacyOpsRequest_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalKnowledgeDemandIntake" ADD CONSTRAINT "LegalKnowledgeDemandIntake_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalKnowledgeResearchBrief" ADD CONSTRAINT "LegalKnowledgeResearchBrief_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "LegalKnowledgeDemandIntake"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalKnowledgeResearchBrief" ADD CONSTRAINT "LegalKnowledgeResearchBrief_preparedByUserId_fkey" FOREIGN KEY ("preparedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalKnowledgeLawyerReviewDecision" ADD CONSTRAINT "LegalKnowledgeLawyerReviewDecision_researchBriefId_fkey" FOREIGN KEY ("researchBriefId") REFERENCES "LegalKnowledgeResearchBrief"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalKnowledgeLawyerReviewDecision" ADD CONSTRAINT "LegalKnowledgeLawyerReviewDecision_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "LegalKnowledgeDemandIntake"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalKnowledgeLawyerReviewDecision" ADD CONSTRAINT "LegalKnowledgeLawyerReviewDecision_gongbuhoPacketId_fkey" FOREIGN KEY ("gongbuhoPacketId") REFERENCES "GongbuhoPacket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AibeopchinCmbConfigRevision" ADD CONSTRAINT "AibeopchinCmbConfigRevision_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AibeopchinCmbPublishEvent" ADD CONSTRAINT "AibeopchinCmbPublishEvent_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "AibeopchinCmbConfigRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AibeopchinCmbPublishEvent" ADD CONSTRAINT "AibeopchinCmbPublishEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GongbuhoPacket" ADD CONSTRAINT "GongbuhoPacket_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GongbuhoPacket" ADD CONSTRAINT "GongbuhoPacket_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GongbuhoTrace" ADD CONSTRAINT "GongbuhoTrace_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GongbuhoTrace" ADD CONSTRAINT "GongbuhoTrace_gongbuhoPacketId_fkey" FOREIGN KEY ("gongbuhoPacketId") REFERENCES "GongbuhoPacket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IllegalLendingReportStatusHistory" ADD CONSTRAINT "IllegalLendingReportStatusHistory_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "IllegalLendingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IllegalLendingReportAccessLog" ADD CONSTRAINT "IllegalLendingReportAccessLog_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "IllegalLendingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IllegalLendingReportAttachment" ADD CONSTRAINT "IllegalLendingReportAttachment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "IllegalLendingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IllegalLendingLawyerReviewRequest" ADD CONSTRAINT "IllegalLendingLawyerReviewRequest_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "IllegalLendingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IllegalLendingLawyerAssignmentHistory" ADD CONSTRAINT "IllegalLendingLawyerAssignmentHistory_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "IllegalLendingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JeonseDamageReportStatusHistory" ADD CONSTRAINT "JeonseDamageReportStatusHistory_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "JeonseDamageReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JeonseDamageReportAccessLog" ADD CONSTRAINT "JeonseDamageReportAccessLog_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "JeonseDamageReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JeonseDamageReportAttachment" ADD CONSTRAINT "JeonseDamageReportAttachment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "JeonseDamageReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JeonseDamageLawyerReviewRequest" ADD CONSTRAINT "JeonseDamageLawyerReviewRequest_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "JeonseDamageReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalDocument" ADD CONSTRAINT "LegalDocument_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalDocumentParagraph" ADD CONSTRAINT "LegalDocumentParagraph_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalDocumentParagraphHistory" ADD CONSTRAINT "LegalDocumentParagraphHistory_paragraphId_fkey" FOREIGN KEY ("paragraphId") REFERENCES "LegalDocumentParagraph"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalDocumentVersion" ADD CONSTRAINT "LegalDocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentGenerationTrace" ADD CONSTRAINT "DocumentGenerationTrace_legalDocumentId_fkey" FOREIGN KEY ("legalDocumentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTimelineEvent" ADD CONSTRAINT "CaseTimelineEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "LegalFormSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseClientPortalAccess" ADD CONSTRAINT "CaseClientPortalAccess_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseClientPortalAccess" ADD CONSTRAINT "CaseClientPortalAccess_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseClientPortalAccess" ADD CONSTRAINT "CaseClientPortalAccess_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSubmission" ADD CONSTRAINT "ClientSubmission_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSubmission" ADD CONSTRAINT "ClientSubmission_supplementRequestId_fkey" FOREIGN KEY ("supplementRequestId") REFERENCES "SupplementRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSubmission" ADD CONSTRAINT "ClientSubmission_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSubmission" ADD CONSTRAINT "ClientSubmission_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSubmissionFile" ADD CONSTRAINT "ClientSubmissionFile_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ClientSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSubmissionFile" ADD CONSTRAINT "ClientSubmissionFile_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "LitigationUploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseConversationThread" ADD CONSTRAINT "CaseConversationThread_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseConversationThread" ADD CONSTRAINT "CaseConversationThread_supplementRequestId_fkey" FOREIGN KEY ("supplementRequestId") REFERENCES "SupplementRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseConversationMessage" ADD CONSTRAINT "CaseConversationMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "CaseConversationThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseConversationMessage" ADD CONSTRAINT "CaseConversationMessage_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseConversationMessage" ADD CONSTRAINT "CaseConversationMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSharedDocument" ADD CONSTRAINT "CaseSharedDocument_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSharedDocument" ADD CONSTRAINT "CaseSharedDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSharedDocument" ADD CONSTRAINT "CaseSharedDocument_sharedByUserId_fkey" FOREIGN KEY ("sharedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSharedDocument" ADD CONSTRAINT "CaseSharedDocument_sharedWithClientUserId_fkey" FOREIGN KEY ("sharedWithClientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDocumentDelivery" ADD CONSTRAINT "CaseDocumentDelivery_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDocumentDelivery" ADD CONSTRAINT "CaseDocumentDelivery_sharedDocumentId_fkey" FOREIGN KEY ("sharedDocumentId") REFERENCES "CaseSharedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDocumentDelivery" ADD CONSTRAINT "CaseDocumentDelivery_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDocumentDelivery" ADD CONSTRAINT "CaseDocumentDelivery_recipientClientUserId_fkey" FOREIGN KEY ("recipientClientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDocumentDelivery" ADD CONSTRAINT "CaseDocumentDelivery_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalMessageLog" ADD CONSTRAINT "ExternalMessageLog_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalMessageLog" ADD CONSTRAINT "ExternalMessageLog_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalMessageLog" ADD CONSTRAINT "ExternalMessageLog_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "CaseDocumentDelivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseMessageAttachment" ADD CONSTRAINT "CaseMessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "CaseConversationMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseMessageAttachment" ADD CONSTRAINT "CaseMessageAttachment_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "LitigationUploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetryJob" ADD CONSTRAINT "RetryJob_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetryJob" ADD CONSTRAINT "RetryJob_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPipelineJob" ADD CONSTRAINT "DocumentPipelineJob_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "LitigationUploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPipelineJob" ADD CONSTRAINT "DocumentPipelineJob_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPipelineJob" ADD CONSTRAINT "DocumentPipelineJob_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalReliabilityActionCandidate" ADD CONSTRAINT "LegalReliabilityActionCandidate_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalReliabilityActionDecisionLedger" ADD CONSTRAINT "LegalReliabilityActionDecisionLedger_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalReliabilityActionDecisionLedger" ADD CONSTRAINT "LegalReliabilityActionDecisionLedger_actionCandidateId_fkey" FOREIGN KEY ("actionCandidateId") REFERENCES "LegalReliabilityActionCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalReliabilityActionOperation" ADD CONSTRAINT "LegalReliabilityActionOperation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalReliabilityActionOperation" ADD CONSTRAINT "LegalReliabilityActionOperation_sourceActionCandidateId_fkey" FOREIGN KEY ("sourceActionCandidateId") REFERENCES "LegalReliabilityActionCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;