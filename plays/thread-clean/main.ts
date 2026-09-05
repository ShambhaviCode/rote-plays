#!/usr/bin/env -S rote play run
/**
 * @rote-frontmatter
 * ---
 * name: thread-clean
 * description: Turn a noisy discussion thread into clear decisions, open questions, and actionable next steps.
 * source_url: https://github.com/ShambhaviCode/rote-plays/tree/main/plays/thread-clean
 * tags:
 * - productivity
 * - communication
 * - developer-tools
 * - decision-making
 * contract:
 *   atomic: true
 *   input:
 *     type: parameters
 *   output:
 *     format: json
 *     destination: stdout
 *   composable: true
 * provenance:
 *   author: shambhavi <mkshambhavi966@gmail.com>
 * parameters:
 * - name: thread_text
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
 *     suspicion_count: 0
 *     audit_sha256: 2d7c9a78e141d30fa8d1cc7cddf843969dbaa86fe6e66712070186cc7ba10a5d
 * steps:
 *   python3:
 *     type: process.exec
 *     argv:
 *     - python3
 *     - '@resource{_rote_python_c.py}'
 *     - '@resource{python3.py}'
 *     - ''
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

out.human(`Rendered ${Object.keys(renderedSteps).length} step(s).`);
out.summary(`Rendered ${Object.keys(renderedSteps).length} step(s).`);
out.result({
  run_id: ctx.run.run_id,
  steps: renderedSteps,
});
