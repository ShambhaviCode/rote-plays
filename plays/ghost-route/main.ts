/**
 * Ghost Route
 *
 * Find remaining code, issue, pull request, test, and documentation references to an API, feature, configuration key, command, or concept being removed.
 *
 * @rote-frontmatter
 * ---
 * name: ghost-route
 * description: Find remaining code, issue, pull request, test, and documentation references to an API, feature, configuration key, command, or concept being removed.
 * provenance:
 *   author: shambhavi <mkshambhavi966@gmail.com>
 * metadata:
 *   rote_version: 0.79.0
 *   version: 0.1.1
 *   status: released
 *   kind: atomic
 *   flow_type: parallel
 *   execution_model: steps_with_presentation
 *   format: typescript
 *   requires_sessions: true
 *   discoverability:
 *     tags:
 *     - typescript
 *     - dependency-analysis
 *     - developer-tools
 *     - github
 * parameters:
 * - name: owner
 *   param_type: string
 *   required: true
 *   default: 'null'
 *   description: GitHub repository owner or organization
 * - name: repo
 *   param_type: string
 *   required: true
 *   default: 'null'
 *   description: GitHub repository name
 * - name: target
 *   param_type: string
 *   required: true
 *   default: 'null'
 *   description: API, feature, endpoint, config key, command, or concept being removed
 * tags:
 * - developer-tools
 * - code-search
 * - cleanup
 * - refactoring
 * contract:
 *   atomic: true
 *   input:
 *     type: parameters
 *   output:
 *     format: json
 *     destination: stdout
 *   composable: true
 * steps:
 *   fetch_data:
 *     type: process.exec
 *     argv:
 *     - python3
 *     - '@resource{ghost-route.py}'
 *     - $owner
 *     - $repo
 *     - $target
 *     timeout_ms: 120000
 * ---
 *
 * Usage:
 *   rote play run ~/.rote/flows/ghost-route/main.ts owner=VALUE repo=VALUE target=VALUE
 *
 * Parameters:
 *   owner - GitHub repository owner or organization (default: null)
 *   repo - GitHub repository name (default: null)
 *   target - API, feature, endpoint, config key, command, or concept being removed (default: null)
 */

// Package non-secret, redistributable, static read-only process payloads under resources/.
// Example process.exec argv: ["python3", "@resource{example.py}"]

const presentationSdk = await import("__ROTE_PRESENTATION_SDK__").catch((cause) => {
  throw new Error(
    "This is a rote steps presentation program. Run it with `rote play run <name>`.",
    { cause },
  );
});
const { FlowOutput, loadPresentationContext, stepName } = presentationSdk;

const out = new FlowOutput();
const ctx = await loadPresentationContext();

const fetchData = ctx.requireAvailable(stepName("fetch_data"));
const processData = ctx.requireAvailable(stepName("process_data"));

out.human("Ghost Route");
out.human("Find remaining code, issue, pull request, test, and documentation references to an API, feature, configuration key, command, or concept being removed.");
out.human("Rendered fetch_data and process_data.");
out.summary("Ghost Route: rendered 2 step(s)");
out.result({
  run_id: ctx.run.run_id,
  steps: {
    "fetch_data": fetchData.body,
    "process_data": processData.body,
  },
});
