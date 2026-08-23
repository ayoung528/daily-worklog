import { createHash } from "node:crypto";

export function digest(value) {
  return createHash("sha256")
    .update(JSON.stringify(value, Object.keys(value).sort()))
    .digest("hex");
}

export function createDraft(workItem, summary, now = new Date()) {
  const content = { workItem, summary, createdAt: now.toISOString() };
  return {
    id: `draft-${workItem.id}-${now.toISOString().slice(0, 10)}`,
    ...content,
    digest: digest(content),
    status: "PENDING",
  };
}

export function approveDraft(draft) {
  if (draft.status !== "PENDING") throw new Error(`Draft cannot be approved from ${draft.status}`);
  return { ...draft, status: "APPROVED" };
}

export function holdDraft(draft) {
  if (draft.status !== "PENDING") throw new Error(`Draft cannot be held from ${draft.status}`);
  return { ...draft, status: "HELD" };
}

export function submitApprovedDraft(draft, submittedIds) {
  if (draft.status !== "APPROVED") throw new Error("Only an explicitly approved draft can be submitted");
  if (submittedIds.has(draft.id)) return { ...draft, status: "ALREADY_SUBMITTED" };
  submittedIds.add(draft.id);
  return { ...draft, status: "SUBMITTED" };
}

export function parseApproval(text, itemCount) {
  const normalized = text.trim().toLowerCase();
  if (normalized === "전부 승인" || normalized === "all approve") {
    return { approve: Array.from({ length: itemCount }, (_, index) => index + 1), hold: [] };
  }
  if (normalized === "전부 보류" || normalized === "all hold") {
    return { approve: [], hold: Array.from({ length: itemCount }, (_, index) => index + 1) };
  }

  const approve = [];
  const hold = [];
  for (const part of normalized.split(",")) {
    const match = part.match(/(\d+)\s*(승인|보류|approve|hold)/);
    if (!match) throw new Error("승인 또는 보류 번호를 해석할 수 없습니다");
    const number = Number(match[1]);
    if (number < 1 || number > itemCount) throw new Error("존재하지 않는 항목 번호입니다");
    const target = match[2] === "승인" || match[2] === "approve" ? approve : hold;
    if (target.includes(number)) throw new Error("같은 번호가 중복 지정되었습니다");
    target.push(number);
  }
  if (approve.some((number) => hold.includes(number))) {
    throw new Error("같은 항목을 승인과 보류로 동시에 지정할 수 없습니다");
  }
  return { approve, hold };
}
