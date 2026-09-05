/**
 * @rote-frontmatter
 * ---
 * name: logdigest
 * description: Compresses noisy application logs into clustered error evidence for faster debugging.
 * provenance:
 *   author: Shambhavi
 * license: MIT
 * parameters:
 * - name: log
 *   type: string
 *   required: true
 *   description: Path to the log file to analyze.
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
 *     - debugging
 *     - logs
 *     - observability
 *     - token-efficiency
 * presentation_fixtures:
 *   digest_log: resources/presentation-fixtures/digest_log/fixture.yaml
 * tags:
 * - developer-tools
 * - logs
 * - debugging
 * - observability
 * steps:
 *   digest_log:
 *     type: process.exec
 *     argv:
 *     - python3
 *     - '@resource{logdigest.py}'
 *     - $log
 *     timeout_ms: 30000
 * ---
 */

const { FlowOutput, loadPresentationContext, stepName } =
  await import("__ROTE_PRESENTATION_SDK__");

const out = new FlowOutput();
const ctx = await loadPresentationContext();

const step = ctx.step(stepName("digest_log"));

if (
  step.outcome.status !== "completed" &&
  step.outcome.status !== "restored"
) {
  throw new Error(
    `digest_log did not complete: ${JSON.stringify(step.outcome)}`
  );
}

const body = step.outcome.output?.body;

if (!body?.stdout?.text) {
  throw new Error("digest_log produced no stdout");
}

const result = JSON.parse(body.stdout.text);

out.human(result);

out.summary(
  `Found ${result.lines_matching_errors} error lines in ${result.lines_total} log lines across ${result.error_clusters.length} error clusters.`
);

out.result(result);
