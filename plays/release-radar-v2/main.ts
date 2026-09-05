#!/usr/bin/env -S rote play run
/**
 * @rote-frontmatter
 * ---
 * name: release-radar-v2
 * description: Inspect a repository for release readiness by checking working-tree state, change summary, latest commit, and test status.
 * source_url: https://github.com/ShambhaviCode/rote-plays/tree/main/plays/release-radar-v2
 * provenance:
 *   author: shambhavi <mkshambhavi966@gmail.com>
 * metadata:
 *   rote_version: 0.78.0
 *   version: 0.1.1
 *   status: released
 *   kind: atomic
 *   flow_type: parallel
 *   execution_model: steps_with_presentation
 *   requires_sessions: false
 * tags:
 * - release
 * - developer-tools
 * - git
 * - testing
 * - release-readiness
 * contract:
 *   atomic: true
 *   input:
 *     type: parameters
 *   output:
 *     format: json
 *     destination: stdout
 *   composable: true
 * steps:
 *   git:
 *     type: process.exec
 *     argv:
 *     - git
 *     - -C
 *     - $repo_path
 *     - status
 *     - --short
 *   git_2:
 *     type: process.exec
 *     argv:
 *     - git
 *     - -C
 *     - $repo_path
 *     - diff
 *     - --stat
 *   git_3:
 *     type: process.exec
 *     argv:
 *     - git
 *     - -C
 *     - $repo_path
 *     - log
 *     - '-1'
 *     - --oneline
 *   npm:
 *     type: process.exec
 *     argv:
 *     - npm
 *     - --prefix
 *     - $repo_path
 *     - test
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
renderedSteps["git"] = renderStep(ctx.step(stepName("git")));
renderedSteps["git_2"] = renderStep(ctx.step(stepName("git_2")));
renderedSteps["git_3"] = renderStep(ctx.step(stepName("git_3")));
renderedSteps["npm"] = renderStep(ctx.step(stepName("npm")));

out.human(`Rendered ${Object.keys(renderedSteps).length} step(s).`);
out.summary(`Rendered ${Object.keys(renderedSteps).length} step(s).`);
out.result({
  run_id: ctx.run.run_id,
  steps: renderedSteps,
});
