/**
 * @rote-frontmatter
 * ---
 * name: scamcheck
 * description: Screen suspicious messages for common scam warning signals.
 * provenance:
 *   author: Shambhavi
 * license: MIT
 * tags:
 * - developer-tools
 * - networking
 * - links
 * - scam-detection
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
 * presentation_fixtures:
 *   check_links: resources/presentation-fixtures/check_links/fixture.yaml
 * steps:
 *   check_links:
 *     type: process.exec
 *     argv:
 *     - python3
 *     - '@resource{linkcheck.py}'
 *     - $urls
 *     timeout_ms: 30000
 * ---
 */

const { FlowOutput, loadPresentationContext, stepName } =
  await import("__ROTE_PRESENTATION_SDK__");

const out = new FlowOutput();
const ctx = await loadPresentationContext();

const step = ctx.step(stepName("check_links"));

if (
  step.outcome.status !== "completed" &&
  step.outcome.status !== "restored"
) {
  throw new Error(
    `check_links did not complete: ${JSON.stringify(step.outcome)}`
  );
}

const body = step.outcome.output?.body;

if (!body?.stdout?.text) {
  throw new Error("check_links produced no stdout");
}

const result = JSON.parse(body.stdout.text);

out.human(result);

out.summary(
  `Checked ${result.total} links: ${result.reachable} reachable, ${result.broken} broken.`
);

out.result(result);
