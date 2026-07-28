import { retryFailedInternalJobSkill } from "./ailawfriend/retry-failed-internal-job-after-human-approval";
import type { ArkaonSkillHandler, ArkaonSkillId } from "./types";

const handlers: ArkaonSkillHandler[] = [retryFailedInternalJobSkill];

export function listArkaonSkills(): ArkaonSkillHandler[] {
  return handlers;
}

export function getArkaonSkill(skillId: string): ArkaonSkillHandler | undefined {
  return handlers.find((handler) => handler.definition.skillId === skillId);
}

export function assertRegisteredSkillId(skillId: string): asserts skillId is ArkaonSkillId {
  if (!getArkaonSkill(skillId)) {
    throw new Error(`Unknown ARKAON skill: ${skillId}`);
  }
}
