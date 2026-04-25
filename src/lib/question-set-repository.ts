import { prisma } from "@/lib/prisma";
import type { QuestionSetDefinition } from "@/lib/definitions";

export async function getQuestionSetDefinitionFromDb(
  code: string,
  version: string,
): Promise<QuestionSetDefinition | null> {
  const item = await prisma.questionSet.findFirst({
    where: {
      code,
      version,
    },
  });

  if (!item?.definitionJson || typeof item.definitionJson !== "object") {
    return null;
  }

  return item.definitionJson as QuestionSetDefinition;
}
