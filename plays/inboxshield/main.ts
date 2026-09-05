/**
 * @rote-frontmatter
 * ---
 * name: scamcheck
 * description: Screen suspicious messages for common scam warning signals.
 * provenance:
 *   author: Shambhavi
 * license: MIT
 * parameters:
 * - name: text
 *   type: string
 *   required: true
 *   description: Message, email, offer, or link text to screen.
 * metadata:
 *   rote_version: 0.75.0
 *   version: 0.1.2
 *   status: released
 *   kind: atomic
 *   flow_type: sequential
 *   execution_model: steps_with_presentation
 *   requires_sessions: false
 *   requires_endpoints: []
 *   contract:
 *     atomic: true
 *     input:
 *       type: none
 *     output:
 *       format: json
 *       destination: stdout
 *     composable: true
 *   discoverability:
 *     tags:
 *     - developer-tools
 *     - networking
 *     - links
 *     - debugging
 *     - web
 *   presentation_fixtures:
 *     check: resources/presentation-fixtures/check.json
 * tags:
 * - developer-tools
 * - inbox
 * - triage
 * - productivity
 * steps:
 *   check:
 *     type: process.exec
 *     argv:
 *     - python3
 *     - '@resource{inboxshield.py}'
 *     - $text
 *     timeout_ms: 30000
 * ---
 */

const { FlowOutput, loadPresentationContext, stepName } =
  await import("__ROTE_PRESENTATION_SDK__");

const out = new FlowOutput();
const ctx = await loadPresentationContext();

const step = ctx.step(stepName("check"));

if (
  step.outcome.status !== "completed" &&
  step.outcome.status !== "restored"
) {
  throw new Error(`check did not complete`);
}

const body = step.outcome.output?.body;
const raw = body?.stdout?.text ?? body?.text ?? body;

const result =
  typeof raw === "string" ? JSON.parse(raw) : raw;

out.human(result);
out.summary(
  `Risk: ${result.risk}. ${result.warning_count ?? result.signals?.length ?? 0} warning signals detected.`
);
out.result(result);
