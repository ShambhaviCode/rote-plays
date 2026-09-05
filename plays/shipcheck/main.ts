#!/usr/bin/env -S rote play run
/**
 * ShipCheck
 *
 * Audits a software repository and produces an evidence-backed production-readiness report.
 *
 * @rote-frontmatter
 * ---
 * name: shipcheck
 * version: 0.1.0
 * description: |
 *   Audits a software repository and produces a concise, evidence-backed production-readiness report. It inspects repository structure, README and documentation, dependency/runtime requirements, environment/configuration requirements, authentication and security-sensitive implementation, tests and CI, and build/deployment configuration. It does not modify the repository.
 * provenance:
 *   author: Shambhavi
 * license: MIT
 * parameters:
 * - name: repo
 *   type: string
 *   required: true
 *   description: Absolute or relative path to the repository to audit.
 * metadata:
 *   rote_version: 0.75.0
 *   version: 0.1.1
 *   status: released
 *   kind: atomic
 *   flow_type: sequential
 *   execution_model: steps_with_presentation
 *   format: typescript
 *   requires_sessions: false
 *   requires_endpoints: []
 *   discoverability:
 *     tags:
 *     - production-readiness
 *     - repository-audit
 *     - security
 *     - ci
 *     - deployment
 *     - effect-readonly
 * tags:
 * - production-readiness
 * - repository-audit
 * - security
 * - ci
 * - deployment
 * - developer-tools
 * contract:
 *   atomic: true
 *   input:
 *     type: parameters
 *   output:
 *     format: json
 *     destination: stdout
 *   composable: true
 * presentation_fixtures:
 *   audit_repo: resources/presentation-fixtures/audit_repo/fixture.yaml
 * steps:
 *   audit_repo:
 *     type: process.exec
 *     argv:
 *     - python3
 *     - '@resource{shipcheck.py}'
 *     - $repo
 *     timeout_ms: 120000
 * ---
 */

const { FlowOutput, loadPresentationContext, stepName } =
  await import("__ROTE_PRESENTATION_SDK__");

const out = new FlowOutput();
const ctx = await loadPresentationContext();

type Evidence = {
  path?: string;
  line?: number;
  detail?: string;
};

type Finding = {
  severity?: "blocker" | "warning" | "good";
  category?: string;
  title?: string;
  detail?: string;
  evidence?: Evidence[];
  action?: string;
};

type Category = {
  category?: string;
  status?: string;
  artifact?: string;
  evidence?: Evidence[];
};

type ShipCheckReport = {
  tool?: string;
  version?: string;
  repository?: string;
  verdict?: string;
  counts?: {
    files_discovered?: number;
    git_tracked_files?: number | null;
    blockers?: number;
    warnings?: number;
    good_practices?: number;
  };
  checked_categories?: Category[];
  not_present?: Category[];
  not_checked?: Category[];
  findings?: Finding[];
  top_actions?: string[];
};

function readJsonStep(): ShipCheckReport {
  const step = ctx.step(stepName("audit_repo"));
  if (step.outcome.status !== "completed" && step.outcome.status !== "restored") {
    throw new Error(`audit_repo did not complete: ${JSON.stringify(step.outcome)}`);
  }
  const body = step.outcome.output.body as { stdout?: { text?: string } } | undefined;
  const text = body?.stdout?.text;
  if (typeof text !== "string" || text.trim() === "") {
    throw new Error(`audit_repo produced no stdout`);
  }
  return JSON.parse(text) as ShipCheckReport;
}

function evidenceText(items: Evidence[] | undefined): string {
  const evidence = (items ?? []).slice(0, 3).map((item) => {
    const loc = item.path ?? ".";
    const line = typeof item.line === "number" ? `:${item.line}` : "";
    const detail = item.detail ? ` - ${item.detail}` : "";
    return `${loc}${line}${detail}`;
  });
  return evidence.length ? evidence.join("; ") : "repository evidence recorded";
}

function section(title: string, findings: Finding[], empty: string): string {
  if (!findings.length) return `## ${title}\n${empty}`;
  return [
    `## ${title}`,
    ...findings.map((finding) => {
      const evidence = evidenceText(finding.evidence);
      const detail = finding.detail ? ` ${finding.detail}` : "";
      const action = finding.action ? ` Action: ${finding.action}` : "";
      return `- ${finding.title ?? "Untitled finding"} [${finding.category ?? "general"}].${detail} Evidence: ${evidence}.${action}`;
    }),
  ].join("\n");
}

const report = readJsonStep();
const findings = report.findings ?? [];
const blockers = findings.filter((finding) => finding.severity === "blocker");
const warnings = findings.filter((finding) => finding.severity === "warning");
const good = findings.filter((finding) => finding.severity === "good");
const checked = report.checked_categories ?? [];
const notPresent = report.not_present ?? [];
const notChecked = report.not_checked ?? [];
const topActions = (report.top_actions ?? []).slice(0, 5);

while (topActions.length < 5) {
  topActions.push("Review repository evidence and close the next highest-risk gap before deployment.");
}

const lines = [
  `# ShipCheck Production-Readiness Report`,
  ``,
  `Repository: ${report.repository ?? String(ctx.params.repo ?? "")}`,
  `Verdict: ${(report.verdict ?? "unknown").toUpperCase()}`,
  `Files discovered: ${report.counts?.files_discovered ?? "unknown"}; Git-tracked files: ${report.counts?.git_tracked_files ?? "unknown"}`,
  ``,
  `## Categories Checked`,
  checked.length
    ? checked.map((item) => `- ${item.category ?? "category"}: ${item.status ?? "checked"} (${evidenceText(item.evidence)})`).join("\n")
    : "- No categories were checked.",
  ``,
  `## Artifacts Not Present`,
  notPresent.length
    ? notPresent.map((item) => `- ${item.category ?? "category"}: ${item.artifact ?? "artifact"} not present`).join("\n")
    : "- None recorded.",
  ``,
  `## Not Checked`,
  notChecked.length
    ? notChecked.map((item) => `- ${item.category ?? "category"}: ${item.artifact ?? "artifact"} not checked`).join("\n")
    : "- None. Absences are listed separately as not present.",
  ``,
  section("Blockers", blockers, "- None found from repository evidence."),
  ``,
  section("Warnings", warnings, "- None found from repository evidence."),
  ``,
  section("Good Practices", good, "- None found from repository evidence."),
  ``,
  `## Top 5 Actions`,
  ...topActions.slice(0, 5).map((action, index) => `${index + 1}. ${action}`),
];

out.human(lines.join("\n"));
out.summary(
  `ShipCheck: ${report.verdict ?? "unknown"}; ` +
    `${blockers.length} blocker(s), ${warnings.length} warning(s), ${good.length} good practice(s).`,
);
out.result({
  tool: "ShipCheck",
  version: report.version ?? "0.1.0",
  repository: report.repository ?? String(ctx.params.repo ?? ""),
  verdict: report.verdict ?? "unknown",
  checked_categories: checked,
  not_present: notPresent,
  not_checked: notChecked,
  blockers,
  warnings,
  good_practices: good,
  top_actions: topActions.slice(0, 5),
  counts: report.counts ?? {},
});

