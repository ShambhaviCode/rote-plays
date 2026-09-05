#!/usr/bin/env -S rote play run
/**
 * @rote-frontmatter
 * ---
 * name: InboxTriage
 * description: Turn inbox items into a structured triage result with priorities and next actions.
 * source_url: https://github.com/ShambhaviCode/rote-plays/tree/main/plays/InboxTriage
 * provenance:
 *   author: shambhavi <mkshambhavi966@gmail.com>
 * metadata:
 *   rote_version: "0.78.0"
 *   version: 0.1.0
 *   status: draft
 *   kind: atomic
 *   flow_type: parallel
 *   execution_model: steps_with_presentation
 *   requires_sessions: false
 * tags:
 * - productivity
 * - inbox
 * - triage
 * - automation
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
 *     - /home/shambhavi/.rote/workspaces/InboxTriage/resources/triage.py
 *     - |-
 *       Priya will send the proposal by Friday
 *       Waiting on Arjun for API credentials
 *       Release moved to Monday
 *       Can you clarify who owns testing?
 *   python3_5:
 *     type: process.exec
 *     argv:
 *     - python3
 *     - /home/shambhavi/.rote/workspaces/InboxTriage/resources/triage.py
 *     - |-
 *       Backend deployment is blocked on the database migration.
 *       Sam will update the integration once the API is ready.
 *       The new onboarding copy is approved.
 *       Who is responsible for the launch checklist?
 *     depends_on:
 *     - python3
 *   python3_4:
 *     type: process.exec
 *     argv:
 *     - python3
 *     - /home/shambhavi/.rote/workspaces/InboxTriage/resources/triage.py
 *     - |-
 *       The homepage copy is approved.
 *       Waiting on Design for the final screenshots.
 *       Please update the FAQ before launch.
 *       Do we know who is handling customer support?
 *     depends_on:
 *     - python3
 *   python3_3:
 *     type: process.exec
 *     argv:
 *     - python3
 *     - /home/shambhavi/.rote/workspaces/InboxTriage/resources/triage.py
 *     - |-
 *       Priya will send the proposal by Friday
 *       Waiting on Arjun for API credentials
 *       Release moved to Monday
 *       Can you clarify who owns testing?
 *     depends_on:
 *     - python3
 *   python3_2:
 *     type: process.exec
 *     argv:
 *     - python3
 *     - /home/shambhavi/.rote/workspaces/InboxTriage/resources/triage.py
 *     - |-
 *       Priya will send the proposal by Friday
 *       Waiting on Arjun for API credentials
 *       Release moved to Monday
 *       Can you clarify who owns testing?
 *     depends_on:
 *     - python3
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
renderedSteps["python3_5"] = renderStep(ctx.step(stepName("python3_5")));
renderedSteps["python3_4"] = renderStep(ctx.step(stepName("python3_4")));
renderedSteps["python3_3"] = renderStep(ctx.step(stepName("python3_3")));
renderedSteps["python3_2"] = renderStep(ctx.step(stepName("python3_2")));

out.human(`Rendered ${Object.keys(renderedSteps).length} step(s).`);
out.summary(`Rendered ${Object.keys(renderedSteps).length} step(s).`);
out.result({
  run_id: ctx.run.run_id,
  steps: renderedSteps,
});
