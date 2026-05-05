import { describe, expect, it } from "vitest";

import { buildCasePackageDto } from "./build-case-package-dto";

describe("buildCasePackageDto", () => {
  it("builds a public-safe case package dto", () => {
    const dto = buildCasePackageDto({
      generatedAt: new Date("2026-05-01T00:00:00.000Z"),
      caseRecord: {
        id: "case_1",
        title: "사기 피해 사건",
        caseType: "사기",
        status: "REVIEW_PENDING",
        createdAt: "2026-04-01T00:00:00.000Z",
        updatedAt: "2026-04-02T00:00:00.000Z",
        clientDisplayName: "최인석",
        opponentDisplayName: "홍길동",
        summary: "피해금액과 기망 내용이 정리된 사건입니다.",
      },
      interview: {
        completed: true,
        answers: [
          {
            questionKey: "damageAmount",
            questionLabel: "피해금액",
            answer: "3,500만원",
          },
        ],
      },
      attachments: [
        {
          id: "att_1",
          filename: "계좌이체내역.pdf",
          mimeType: "application/pdf",
          sizeBytes: 1000,
          uploadedAt: "2026-04-03T00:00:00.000Z",
        },
      ],
      documents: [
        {
          id: "doc_1",
          title: "고소장 초안",
          status: "APPROVED",
          latestVersionLabel: "v1",
          approved: true,
          printable: true,
          guardrailSummary: {
            generationPolicy: "NO_UNVERIFIED_FACTS",
            guardrailCheckStatusLabel: "통과",
            checkedAtLabel: "2026. 5. 1.",
            warningMissingFieldCount: 0,
          },
        },
      ],
    });

    expect(dto.packageMeta).toEqual({
      caseId: "case_1",
      packageTitle: "사기 피해 사건",
      generatedAt: "2026-05-01T00:00:00.000Z",
      packageVersion: "6.1",
      source: "CASE_PACKAGE_DRAFT",
    });
    expect(dto.parties.client.displayName).toBe("최**");
    expect(dto.parties.client.isMasked).toBe(true);
    expect(dto.parties.opponents[0]?.displayName).toBe("홍**");
    expect(dto.interview.answerCount).toBe(1);
    expect(dto.attachments[0]?.downloadable).toBe(false);
    expect(dto.documents[0]?.guardrailSummary?.generationPolicy).toBe(
      "NO_UNVERIFIED_FACTS",
    );
    expect(dto.safety.includesLegalAdvice).toBe(false);
    expect(dto.safety.requiresLawyerReview).toBe(true);
    expect(dto.sharingDefaults.defaultExpiresInDays).toBe(7);
  });

  it("adds follow-up items when summary attachments documents or opponent are missing", () => {
    const dto = buildCasePackageDto({
      generatedAt: new Date("2026-05-01T00:00:00.000Z"),
      caseRecord: {
        id: "case_2",
        title: null,
        caseType: "민사",
        status: "IN_INTERVIEW",
        clientDisplayName: null,
        opponentDisplayName: null,
        summary: null,
      },
    });

    expect(dto.packageMeta.packageTitle).toBe("민사 사건 패키지");
    expect(dto.summary.shortSummary).toBe("사건 요약이 아직 생성되지 않았습니다.");
    expect(dto.followUp.map((item) => item.fieldKey)).toEqual([
      "case.summary",
      "case.attachments",
      "case.documents",
      "case.opponent",
    ]);
  });

  it("truncates long interview answers", () => {
    const longAnswer = "가".repeat(150);
    const dto = buildCasePackageDto({
      caseRecord: {
        id: "case_3",
        title: "인터뷰 테스트",
        status: "IN_INTERVIEW",
      },
      interview: {
        completed: false,
        answers: [
          {
            questionKey: "long",
            questionLabel: "긴 답변",
            answer: longAnswer,
          },
        ],
      },
    });

    const preview = dto.interview.publicSafeAnswers[0]?.answerPreview;
    expect(preview?.length).toBeLessThan(longAnswer.length);
    expect(preview?.endsWith("...")).toBe(true);
  });
});
