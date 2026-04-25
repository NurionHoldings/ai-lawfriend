/**
 * 실제 AI 엔진 연결 전까지의 안전한 기본 생성기.
 * 기존 regenerate 엔진이 있으면 generateParagraphContent / regenerateParagraphContent만 교체하면 됩니다.
 */

export async function generateParagraphContent(args: {
  title: string;
  seedContent: string;
  aiPromptKey?: string;
}) {
  if (!args.seedContent?.trim()) return "";
  return args.seedContent.trim();
}

export async function regenerateParagraphContent(args: {
  title: string;
  currentContent: string;
  aiPromptKey?: string;
  instruction?: string;
}) {
  const base = args.currentContent.trim();
  if (!base) return "";
  if (!args.instruction?.trim()) return base;
  return `${base}\n\n[재작성 지시 반영]\n${args.instruction.trim()}`;
}
