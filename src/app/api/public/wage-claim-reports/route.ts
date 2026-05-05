import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  generateWageClaimChecklistText,
  generateWageClaimStatementText,
  generateWageClaimTableText,
} from "@/features/wage-claim/wage-claim-report-generator";
import { CreateWageClaimReportSchema } from "@/features/wage-claim/wage-claim.schema";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getClientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

const memoryRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string) {
  const now = Date.now();
  const current = memoryRateLimit.get(key);

  if (!current || current.resetAt < now) {
    memoryRateLimit.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (current.count >= 10) return false;

  current.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          ok: false,
          message: "요청이 일시적으로 많습니다. 잠시 후 다시 시도해 주세요.",
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const parsed = CreateWageClaimReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "입력값을 확인해 주세요.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const input = parsed.data;

    if (input.website && input.website.trim().length > 0) {
      return NextResponse.json({
        ok: true,
        id: "ignored",
        generatedStatement: "",
        generatedTable: "",
        generatedChecklist: "",
      });
    }

    const generatedStatement = generateWageClaimStatementText(input);
    const generatedTable = generateWageClaimTableText(input);
    const generatedChecklist = generateWageClaimChecklistText(input);
    const uploadToken = crypto.randomBytes(24).toString("hex");

    const created = await prisma.wageClaimReport.create({
      data: {
        reporterType: input.reporterType,
        reporterName: input.reporterName,
        reporterPhone: input.reporterPhone,
        reporterEmail: input.reporterEmail || null,

        workerName: input.workerName || null,
        workerPhone: input.workerPhone || null,

        employerName: input.employerName || null,
        companyName: input.companyName,
        companyAddress: input.companyAddress || null,
        companyPhone: input.companyPhone || null,
        workplaceAddress: input.workplaceAddress || null,

        employmentType: input.employmentType,
        jobDescription: input.jobDescription || null,
        hireDate: input.hireDate,
        resignationDate: input.resignationDate,
        isResigned: input.isResigned,

        monthlyWageAmount: input.monthlyWageAmount,
        dailyWageAmount: input.dailyWageAmount,
        hourlyWageAmount: input.hourlyWageAmount,
        agreedPayMemo: input.agreedPayMemo || null,

        unpaidWageAmount: input.unpaidWageAmount,
        unpaidSeveranceAmount: input.unpaidSeveranceAmount,
        unpaidAllowanceAmount: input.unpaidAllowanceAmount,
        unpaidTotalAmount: input.unpaidTotalAmount,
        unpaidPeriod: input.unpaidPeriod || null,
        paymentDueDate: input.paymentDueDate,

        damageTypes: input.damageTypes,
        requestHistory: input.requestHistory || null,
        evidenceSummary: input.evidenceSummary || null,
        damageSummary: input.damageSummary,
        requestedHelp: input.requestedHelp || null,

        generatedStatement,
        generatedTable,
        generatedChecklist,

        consentPrivacy: input.consentPrivacy,
        consentNoLegalAdvice: input.consentNoLegalAdvice,
        uploadToken,
      },
      select: {
        id: true,
        uploadToken: true,
        generatedStatement: true,
        generatedTable: true,
        generatedChecklist: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      id: created.id,
      uploadToken: created.uploadToken,
      generatedStatement: created.generatedStatement,
      generatedTable: created.generatedTable,
      generatedChecklist: created.generatedChecklist,
      createdAt: created.createdAt,
    });
  } catch (error) {
    console.error("[wage-claim-report:create]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "임금체불 진정서 초안 생성 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
