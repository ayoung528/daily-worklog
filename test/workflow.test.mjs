import test from "node:test";
import assert from "node:assert/strict";
import {
  approveDraft,
  createDraft,
  holdDraft,
  parseApproval,
  submitApprovedDraft,
} from "../src/workflow.mjs";

test("creates a pending draft and changes it through explicit approval", () => {
  const draft = createDraft({ id: 12, title: "Improve onboarding" }, "Draft a concise update");
  assert.equal(draft.status, "PENDING");
  assert.equal(approveDraft(draft).status, "APPROVED");
  assert.equal(holdDraft(draft).status, "HELD");
});

test("parses approval and hold responses", () => {
  assert.deepEqual(parseApproval("1 승인, 2 보류", 2), { approve: [1], hold: [2] });
});

test("prevents duplicate submission", () => {
  const draft = approveDraft(createDraft({ id: 1, title: "Example" }, "Summary"));
  const submitted = new Set();
  assert.equal(submitApprovedDraft(draft, submitted).status, "SUBMITTED");
  assert.equal(submitApprovedDraft(draft, submitted).status, "ALREADY_SUBMITTED");
});
