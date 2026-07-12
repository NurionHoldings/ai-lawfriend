import { AibeopchinCharacterModel } from "@/components/brand/aibeopchin-character-model";
import { KoreanPhraseBlock } from "@/components/ui/korean-lines";
import {
  AIBEOPCHIN_HOME_FLOW_HEADING_LINES,
  AIBEOPCHIN_HOME_FLOW_STEPS,
} from "@/lib/branding/aibeopchin-marketing-copy";
import {
  KOREAN_BODY_COMPACT_CLASS,
  KOREAN_EYEBROW_CLASS,
  KOREAN_HEADING_CLASS,
  KOREAN_SECTION_HEADING_CLASS,
} from "@/lib/ui/korean-mobile-typography.policy";

export function HomeFlowSection() {
  return (
    <section
      className="mx-auto max-w-7xl px-4 py-12 sm:px-5 sm:py-16 md:px-8"
      aria-labelledby="home-flow-heading"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] lg:items-end">
        <div className="max-w-3xl">
          <p className={`${KOREAN_EYEBROW_CLASS} text-cyan-600 normal-case tracking-normal sm:tracking-wide`}>
            Workflow
          </p>
          <KoreanPhraseBlock
            as="h2"
            id="home-flow-heading"
            phrases={AIBEOPCHIN_HOME_FLOW_HEADING_LINES}
            className={`mt-2 ${KOREAN_SECTION_HEADING_CLASS} text-slate-950`}
          />
        </div>

        <AibeopchinCharacterModel
          variant="victory"
          label="사건 흐름 완료를 표현하는 AI법친 승리 3D 캐릭터"
          compact
          className="border-slate-200 bg-[radial-gradient(circle_at_50%_22%,rgba(201,162,39,0.24),transparent_34%),linear-gradient(145deg,rgba(31,76,56,0.72),rgba(15,23,42,0.92))]"
        />
      </div>

      <ol className="mt-6 grid list-none gap-4 sm:mt-8 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
        {AIBEOPCHIN_HOME_FLOW_STEPS.map((step) => (
          <li
            key={step.title}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <h3 className={`${KOREAN_HEADING_CLASS} font-bold text-slate-950`}>{step.title}</h3>
            <KoreanPhraseBlock
              as="p"
              phrases={step.bodyLines}
              className={`mt-3 ${KOREAN_BODY_COMPACT_CLASS} text-slate-600`}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
