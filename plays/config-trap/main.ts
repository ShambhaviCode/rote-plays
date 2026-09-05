/**
 * Config Trap
 *
 * Find inconsistent uses of an environment variable, configuration key, feature flag, or deployment setting across source code, CI, tests, deployment files, and documentation.
 *
 * @rote-frontmatter
 * ---
 * name: config-trap
 * description: "Find inconsistent uses of an environment variable, configuration key, feature flag, or deployment setting across source code, CI, tests, deployment files, and documentation."
 * source_url: https://github.com/ShambhaviCode/rote-plays/tree/main/plays/config-trap
 * provenance:
 *   author: "shambhavi <mkshambhavi966@gmail.com>"
 * metadata:
 *   rote_version: 0.79.0
 *   version: 0.1.0
 *   status: draft
 *   kind: atomic
 *   flow_type: parallel
 *   execution_model: steps_with_presentation
 *   format: typescript
 *   requires_endpoints:
 *   - github
 *   requires_sessions: true
 *   mcp_servers:
 *     github:
 *       fingerprint: mcp_uogxetWJ9s2mSDiBKftmvwkDfu
 *       server_info:
 *         name: github
 *         version: 3.0.3
 *       capabilities:
 *         tools: true
 *         resources: false
 *         prompts: false
 *         logging: false
 *       tool_count: 1224
 *       endpoint_name: github
 *       export_uri: https://api.github.com
 *       captured_at: 2026-09-04T05:57:38.744355+00:00
 *   discoverability:
 *     tags:
 *     - typescript
 *     - configuration
 *     - devops
 *     - developer-tools
 *     - github
 * parameters:
 * - name: owner
 *   param_type: string
 *   required: true
 *   default: "null"
 *   description: "GitHub repository owner or organization"
 * - name: repo
 *   param_type: string
 *   required: true
 *   default: "null"
 *   description: "GitHub repository name"
 * - name: target
 *   param_type: string
 *   required: true
 *   default: "null"
 *   description: "Environment variable, configuration key, feature flag, or deployment setting"
 * tags:
 * - developer-tools
 * - configuration
 * - debugging
 * - deployment
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
 *     endpoint: adapter/github
 *     method: search/code
 *     params:
 *       q: "$target repo:$owner/$repo"
 *       per_page: 50
 *   process_data:
 *     endpoint: adapter/github
 *     method: search/issues-and-pull-requests
 *     depends_on: [fetch_data]
 *     params:
 *       q: "$target repo:$owner/$repo is:pr"
 *       per_page: 20
 * ---
 *
 * Usage:
 *   rote play run ~/.rote/flows/config-trap/main.ts owner=VALUE repo=VALUE target=VALUE
 *
 * Parameters:
 *   owner - GitHub repository owner or organization (default: null)
 *   repo - GitHub repository name (default: null)
 *   target - Environment variable, configuration key, feature flag, or deployment setting (default: null)
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

out.human("Config Trap");
out.human("Find inconsistent uses of an environment variable, configuration key, feature flag, or deployment setting across source code, CI, tests, deployment files, and documentation.");
out.human("Rendered fetch_data and process_data.");
out.summary("Config Trap: rendered 2 step(s)");
out.result({
  run_id: ctx.run.run_id,
  steps: {
    "fetch_data": fetchData.body,
    "process_data": processData.body,
  },
});
