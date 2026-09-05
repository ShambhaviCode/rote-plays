#!/usr/bin/env -S rote play run
/**
 * EnvGuard
 *
 * Finds environment variables used by a repository and compares them
 * with the documented .env.example configuration.
 *
 * @rote-frontmatter
 * ---
 * name: envguard
 * description: "Check a repository for unsafe or inconsistent environment-variable usage and surface actionable configuration risks."
 * version: 0.1.0
 * source_url: https://github.com/ShambhaviCode/rote-plays/tree/main/plays/envguard
 *   Audits repository environment configuration without modifying the repository.
 *   Detects environment variables used by application code, compares them with
 *   .env.example, and provides file/line evidence for undocumented variables.
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
 *     - environment
 *     - configuration
 *     - developer-tools
 *     - repository-audit
 *     - debugging
 * presentation_fixtures:
 *   audit_env: resources/presentation-fixtures/audit_env/fixture.yaml
 * fixtures:
 * - resources/presentation-fixtures/audit_env/fixture.yaml
 * tags:
 * - developer-tools
 * - environment
 * - configuration
 * - debugging
 * steps:
 *   audit_env:
 *     type: process.exec
 *     argv:
 *     - python3
 *     - '@resource{envguard.py}'
 *     - $repo
 * ---
 */

const { FlowOutput, loadPresentationContext, stepName } =
  await import("__ROTE_PRESENTATION_SDK__");

const out = new FlowOutput();
const ctx = await loadPresentationContext();

const report = ctx.step(stepName("audit_env"));
if (
  report.outcome.status !== "completed" &&
  report.outcome.status !== "restored"
) {
  throw new Error(
    `audit_env did not complete: ${JSON.stringify(report.outcome)}`
  );
}

const body = report.outcome.output.body as
  | { stdout?: { text?: string } }
  | undefined;

const text = body?.stdout?.text;

if (typeof text !== "string" || text.trim() === "") {
  throw new Error("audit_env produced no stdout");
}

const result = JSON.parse(text) as {
  project?: string;
  variables_used?: string[];
  variables_documented?: string[];
  missing_from_example?: string[];
  documented_but_unused?: string[];
  findings?: Array<{
    kind: string;
    variable: string;
    evidence?: {
      path?: string;
      line?: number;
    };
    recommendation?: string;
  }>;
};

const missing = result.missing_from_example ?? [];

const lines = [
  "# EnvGuard",
  "",
  `**Project:** ${result.project ?? "Repository"}`,
  "",
  "## Environment configuration",
  "",
  `- Variables used: ${result.variables_used?.length ?? 0}`,
  `- Variables documented: ${result.variables_documented?.length ?? 0}`,
  `- Missing from .env.example: ${missing.length}`,
  "",
  "## Findings",
];

if (result.findings?.length) {
  for (const finding of result.findings) {
    const location = finding.evidence
      ? `${finding.evidence.path ?? "unknown"}${
          typeof finding.evidence.line === "number"
            ? `:${finding.evidence.line}`
            : ""
        }`
      : "unknown location";

    lines.push(
      "",
      `### ${finding.variable}`,
      `- Evidence: ${location}`,
      `- Recommendation: ${
        finding.recommendation ?? "Document the variable."
      }`
    );
  }
} else {
  lines.push("", "No undocumented environment variables detected.");
}

lines.push(
  "",
  "## Summary",
  "",
  missing.length === 0
    ? "Environment usage is fully represented in .env.example."
    : `${missing.length} environment variable(s) need documentation review.`
);

out.human(lines.join("\n"));
out.summary(
  `${result.project ?? "Repository"}: ${missing.length} undocumented environment variable(s)`
);
out.result(result);
