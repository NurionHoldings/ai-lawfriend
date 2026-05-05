import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  generateJeonseDamageChecklistText,
  generateJeonseDamageSummaryText,
} from "@/features/jeonse-damage/jeonse-damage-report-generator";
import { CreateJeonseDamageReportSchema } from "@/features/jeonse-damage/jeonse-damage.schema";
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
    const parsed = CreateJeonseDamageReportSchema.safeParse(body);

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
        generatedSummary: "",
        generatedChecklist: "",
      });
    }

    const generatedSummary = generateJeonseDamageSummaryText(input);
    const generatedChecklist = generateJeonseDamageChecklistText(input);
    const uploadToken = crypto.randomBytes(24).toString("hex");

    const created = await prisma.jeonseDamageReport.create({
      data: {
        reporterType: input.reporterType,
        reporterName: input.reporterName,
        reporterPhone: input.reporterPhone,
        reporterEmail: input.reporterEmail || null,
        tenantName: input.tenantName || null,
        tenantPhone: input.tenantPhone || null,
        propertyAddress: input.propertyAddress,
        propertyType: input.propertyType || null,
        moveInDate: input.moveInDate,
        fixedDate: input.fixedDate,
        hasMoveInReport: input.hasMoveInReport,
        hasFixedDate: input.hasFixedDate,
        hasPossession: input.hasPossession,
        hasLeaseRegistration: input.hasLeaseRegistration,
        hasJeonseRight: input.hasJeonseRight,
        leaseStartDate: input.leaseStartDate,
        leaseEndDate: input.leaseEndDate,
        depositAmount: input.depositAmount,
        monthlyRentAmount: input.monthlyRentAmount,
        contractMemo: input.contractMemo || null,
        landlordName: input.landlordName || null,
        landlordPhone: input.landlordPhone || null,
        landlordAddress: input.landlordAddress || null,
        landlordMemo: input.landlordMemo || null,
        brokerName: input.brokerName || null,
        brokerOfficeName: input.brokerOfficeName || null,
        brokerPhone: input.brokerPhone || null,
        brokerMemo: input.brokerMemo || null,
        damageTypes: input.damageTypes,
        returnRequestHistory: input.returnRequestHistory || null,
        auctionOrSaleStatus: input.auctionOrSaleStatus || null,
        investigationStatus: input.investigationStatus || null,
        damageSummary: input.damageSummary,
        requestedHelp: input.requestedHelp || null,
        evidenceSummary: input.evidenceSummary || null,
        generatedSummary,
        generatedChecklist,
        consentPrivacy: input.consentPrivacy,
        consentNoLegalAdvice: input.consentNoLegalAdvice,
        uploadToken,
      },
      select: {
        id: true,
        uploadToken: true,
        generatedSummary: true,
        generatedChecklist: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      id: created.id,
      uploadToken: created.uploadToken,
      generatedSummary: created.generatedSummary,
      generatedChecklist: created.generatedChecklist,
      createdAt: created.createdAt,
    });
  } catch (error) {
    console.error("[jeonse-damage-report:create]", error);
    return NextResponse.json(
      {
        ok: false,
        message: "서류 정리 요약서 생성 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
