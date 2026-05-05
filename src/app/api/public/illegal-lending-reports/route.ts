import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateIllegalLendingReportSchema } from "@/features/illegal-lending/illegal-lending.schema";
import { generateIllegalLendingReportText } from "@/features/illegal-lending/illegal-lending-report-generator";

export const runtime = "nodejs";

function getClientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

const memoryRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
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

    const body: unknown = await req.json();
    const parsed = CreateIllegalLendingReportSchema.safeParse(body);

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

    // 봇 제출 방지용 honeypot
    if (input.website && input.website.trim().length > 0) {
      return NextResponse.json({ ok: true, id: "ignored", generatedReport: "" });
    }

    const generatedReport = generateIllegalLendingReportText(input);
    const uploadToken = crypto.randomBytes(24).toString("hex");

    const created = await prisma.illegalLendingReport.create({
      data: {
        reporterType: input.reporterType,
        reporterName: input.reporterName,
        reporterPhone: input.reporterPhone,
        reporterEmail: input.reporterEmail || null,
        uploadToken,

        victimName: input.victimName || null,
        victimPhone: input.victimPhone || null,

        creditorName: input.creditorName || null,
        creditorPhone: input.creditorPhone || null,
        creditorBusinessName: input.creditorBusinessName || null,
        creditorAccount: input.creditorAccount || null,
        creditorMemo: input.creditorMemo || null,

        loanDate: input.loanDate,
        principalAmount: input.principalAmount,
        receivedAmount: input.receivedAmount,
        repaidAmount: input.repaidAmount,
        demandedAmount: input.demandedAmount,
        interestRateMemo: input.interestRateMemo || null,

        damageTypes: input.damageTypes,
        collectionMethods: input.collectionMethods || null,
        damageSummary: input.damageSummary,
        requestedHelp: input.requestedHelp || null,

        evidenceSummary: input.evidenceSummary || null,
        generatedReport,

        consentPrivacy: input.consentPrivacy,
        consentNoLegalAdvice: input.consentNoLegalAdvice,
      },
      select: {
        id: true,
        uploadToken: true,
        generatedReport: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      id: created.id,
      uploadToken: created.uploadToken,
      generatedReport: created.generatedReport,
      createdAt: created.createdAt,
    });
  } catch (error) {
    console.error("[illegal-lending-report:create]", error);

    return NextResponse.json(
      { ok: false, message: "신고서 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
