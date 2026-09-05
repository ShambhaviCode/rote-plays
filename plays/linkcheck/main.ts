/**
 * @rote-frontmatter
 * ---
 * name: linkcheck
 * description: Checks a list of URLs and reports reachable, broken, redirected, and HTTP status results.
 * source_url: https://github.com/ShambhaviCode/rote-plays/tree/main/plays/linkcheck
 * provenance:
 *   author: Shambhavi
 * license: MIT
 * parameters:
 * - name: urls
 *   type: string
 *   required: true
 *   description: Path to a text file containing one URL per line.
 * metadata:
 *   rote_version: 0.75.0
 *   version: 0.1.1
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
 * tags:
 * - developer-tools
 * - links
 * - validation
 * - debugging
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
