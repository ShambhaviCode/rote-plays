#!/usr/bin/env -S rote play run
/**
 * DevFix
 *
 * Read-only repository failure triage.
 *
 * @rote-frontmatter
 * ---
 * name: devfix
 * version: 0.1.0
 * description: Read-only repository failure triage with evidence-backed fixes.
 * provenance:
 *   author: Shambhavi
 * license: MIT
 * parameters:
 * - name: repo
 *   type: string
 *   required: true
 *   description: Absolute or relative path to the repository to inspect.
 * metadata:
 *   rote_version: 0.75.0
 *   version: 0.1.1
 *   status: released
 *   kind: atomic
 *   flow_type: sequential
 *   execution_model: steps_with_presentation
 *   requires_sessions: false
 *   requires_endpoints: []
 *   discoverability:
 *     tags:
 *     - debugging
 *     - repository-audit
 *     - testing
 *     - ci
 *     - developer-tools
 *     - effect-readonly
 * presentation_fixtures:
 *   audit_repo: resources/presentation-fixtures/audit_repo/fixture.yaml
 * tags:
 * - developer-tools
 * - debugging
 * - diagnostics
 * - maintenance
 * contract:
 *   atomic: true
 *   input:
 *     type: parameters
 *   output:
 *     format: json
 *     destination: stdout
 *   composable: true
 * steps:
 *   audit_repo:
 *     type: process.exec
 *     argv:
 *     - python3
 *     - '@resource{devfix.py}'
 *     - $repo
 *     timeout_ms: 120000
 * ---
 */

const { FlowOutput, loadPresentationContext, stepName } =
  await import("__ROTE_PRESENTATION_SDK__");

const out = new FlowOutput();
const ctx = await loadPresentationContext();

const step = ctx.step(stepName("audit_repo"));

if (
  step.outcome.status !== "completed" &&
  step.outcome.status !== "restored"
) {
  throw new Error(
    `audit_repo did not complete: ${JSON.stringify(step.outcome)}`
  );
}

const body = step.outcome.output.body as
  | { stdout?: { text?: string } }
  | undefined;

const text = body?.stdout?.text;

if (typeof text !== "string" || text.trim() === "") {
  throw new Error("audit_repo produced no stdout");
}

const report = JSON.parse(text) as {
  project?: string;
  checks?: Array<{
    name: string;
    status: string;
    evidence?: string;
  }>;
  failures?: Array<{
    category: string;
    evidence: string;
    recommendation: string;
    verify: string;
  }>;
};

const lines: string[] = [];

lines.push("# DevFix");
lines.push("");
lines.push(`**Project:** ${report.project ?? "Unknown"}`);
lines.push("");
lines.push("## Checks");

for (const check of report.checks ?? []) {
  lines.push(
    `- **${check.status}** ${check.name}${
      check.evidence ? ` — ${check.evidence}` : ""
    }`
  );
}

lines.push("");
lines.push("## Failures and fixes");

if ((report.failures ?? []).length === 0) {
  lines.push("No actionable failures detected.");
} else {
  for (const failure of report.failures ?? []) {
    lines.push(`### ${failure.category}`);
    lines.push(`- Evidence: ${failure.evidence}`);
    lines.push(`- Recommended fix: ${failure.recommendation}`);
    lines.push(`- Verify: \`${failure.verify}\``);
  }
}

out.human(lines.join("\n"));
out.summary(
  `${report.project ?? "Repository"}: ${
    report.failures?.length ?? 0
  } actionable failure(s)`
);
out.result(report);
