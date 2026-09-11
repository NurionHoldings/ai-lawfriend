import { describe, expect, it } from "vitest";
import {
  anonymizeLawyerArgumentTheme,
  assertLawyerArgumentSocialProofPrivacy,
  buildLawyerArgumentSocialProof,
} from "../lawyer-argument-social-proof";

describe("lawyer-argument-social-proof", () => {
  it("anonymizes contact-like tokens in theme labels", () => {
    expect(anonymizeLawyerArgumentTheme("연락 client@example.com")).toBe(
      "연락 client@***",
    );
  });

  it("builds privacy-safe social proof without raw case titles", () => {
    const proof = buildLawyerArgumentSocialProof({
      themeLabel: "임금 체불 정리",
      supportingCaseTitles: ["김OO 임금 사건", "박OO 퇴직금 사건"],
      clientEmail: "client@example.com",
      lawyerDisplayName: "홍길동",
    });

    expect(proof.anonymizedTheme).toBe("임금 체불 정리");
    expect(proof.evidenceCountBand).toBe("few");
    expect(JSON.stringify(proof)).not.toContain("김OO");
    expect(JSON.stringify(proof)).not.toContain("client@example.com");
    expect(
      assertLawyerArgumentSocialProofPrivacy(proof, {
        themeLabel: "임금 체불 정리",
        supportingCaseTitles: ["김OO 임금 사건", "박OO 퇴직금 사건"],
        clientEmail: "client@example.com",
        lawyerDisplayName: "홍길동",
      }),
    ).toBe(true);
  });
});
