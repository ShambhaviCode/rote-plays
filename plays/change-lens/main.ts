#!/usr/bin/env -S rote play run
/**
 * @rote-frontmatter
 * ---
 * name: change-lens
 * description: Analyze a Git diff and produce an evidence-backed impact map of files, references, risks, and next checks.
 * provenance:
 *   author: shambhavi <mkshambhavi966@gmail.com>
 * parameters:
 * - name: repo_path
 *   type: string
 *   required: true
 *   description: Play parameter
 * - name: git_range
 *   type: string
 *   required: true
 *   description: Play parameter
 * metadata:
 *   version: 0.1.1
 *   rote_version: 0.80.0
 *   status: released
 *   kind: atomic
 *   flow_type: parallel
 *   execution_model: steps_with_presentation
 *   requires_sessions: false
 *   hardcode_audit:
 *     schema: 2
 *     suspicion_count: 2
 *     audit_sha256: a2f987983632b4af74a60fd9c5ab9922dc9e3220848ddc5d903fbd21b1da2657
 * tags:
 * - developer-tools
 * - git
 * - impact-analysis
 * - debugging
 * contract:
 *   atomic: true
 *   input:
 *     type: parameters
 *   output:
 *     format: json
 *     destination: stdout
 *   composable: true
 * steps:
 *   python3:
 *     type: process.exec
 *     argv:
 *     - python3
 *     - '@resource{_rote_python_c.py}'
 *     - '@resource{python3.py}'
 *     - $repo_path
 *     - $git_range
 * ---
 */

const presentationSdk = await import("__ROTE_PRESENTATION_SDK__").catch((cause) => {
  throw new Error(
    "This is a rote steps presentation program. Run it with `rote play run <name>`.",
    { cause },
  );
});
const { FlowOutput, loadPresentationContext, stepName } = presentationSdk;

const out = new FlowOutput();
const ctx = await loadPresentationContext();

const renderedSteps: Record<string, unknown> = {};

// Takes the step handle (not the name) so every `stepName("...")` at the
// call sites stays a literal that lint can verify against `steps:`.
function renderStep(step: ReturnType<typeof ctx.step>): unknown {
  switch (step.outcome.status) {
    // A restored step completed, in an earlier run, so it reads exactly like one.
    case "completed":
    case "restored":
      return step.outcome.output.body;
    case "skipped":
      return { status: "skipped", reason: step.outcome.output.reason };
    case "failed":
      return { status: "failed", message: step.outcome.output.message };
    case "blocked":
      return {
        status: "blocked",
        reason: step.outcome.output.reason,
        blocked_by: step.outcome.output.blocked_by ?? [],
      };
    default:
      // Unreachable while this body matches the SDK. A play exported before a new
      // outcome status was added lands here instead, so name the remedy.
      throw new Error(
        `unsupported step outcome: ${JSON.stringify(step.outcome)}. ` +
          `Re-export the play to regenerate this switch.`,
      );
  }
}
renderedSteps["python3"] = renderStep(ctx.step(stepName("python3")));
renderedSteps["python3"] = renderStep(ctx.step(stepName("python3")));
renderedSteps["python3"] = renderStep(ctx.step(stepName("python3")));

out.human(`Rendered ${Object.keys(renderedSteps).length} step(s).`);
out.summary(`Rendered ${Object.keys(renderedSteps).length} step(s).`);
out.result({
  run_id: ctx.run.run_id,
  steps: renderedSteps,
});
