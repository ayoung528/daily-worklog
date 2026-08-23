import { createDraft } from "./workflow.mjs";

export function generateDailyDrafts(workItems, summaryFor, now = new Date()) {
  const drafts = workItems.map((item) => createDraft(item, summaryFor(item), now));
  return {
    generatedAt: now.toISOString(),
    drafts,
    notification: "DevCenter 작업 산출물이 생성됐습니다. 검토가 필요합니다.",
  };
}
