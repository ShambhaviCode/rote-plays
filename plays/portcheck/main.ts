/**
 * @rote-frontmatter
 * ---
 * name: portcheck
 * description: Checks whether a local TCP port is available for development.
 * source_url: https://github.com/ShambhaviCode/rote-plays/tree/main/plays/portcheck
 * provenance:
 *   author: Shambhavi
 * license: MIT
 * tags:
 * - developer-tools
 * - networking
 * - debugging
 * - local-development
 * parameters:
 * - name: port
 *   type: integer
 *   required: true
 *   description: Local TCP port to check.
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
 *     - debugging
 *     - ports
 * presentation_fixtures:
 *   check_port: resources/presentation-fixtures/check_port/fixture.yaml
 * steps:
 *   check_port:
 *     type: process.exec
 *     argv:
 *     - python3
 *     - '@resource{portcheck.py}'
 *     - $port
 *     timeout_ms: 30000
 * ---
 */

const { FlowOutput, loadPresentationContext, stepName } =
  await import("__ROTE_PRESENTATION_SDK__");

const out = new FlowOutput();
const ctx = await loadPresentationContext();

const step = ctx.step(stepName("check_port"));

if (
  step.outcome.status !== "completed" &&
  step.outcome.status !== "restored"
) {
  throw new Error(
    `check_port did not complete: ${JSON.stringify(step.outcome)}`
  );
}

const body = step.outcome.output?.body;

if (!body?.stdout?.text) {
  throw new Error("check_port produced no stdout");
}

const result = JSON.parse(body.stdout.text);

out.human(result);
out.summary(result);
out.result(result);
