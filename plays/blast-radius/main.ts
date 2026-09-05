source_url: https://github.com/shambhavi/blast-radius
/**
 * Blast Radius
 *
 * Analyze a GitHub pull request and identify its potential blast radius from evidence in the repository.
 *
 * @rote-frontmatter
 * ---
 * name: blast-radius
 * description: Analyze a GitHub pull request and identify its potential blast radius from evidence in the repository.
 * provenance:
 *   author: shambhavi <mkshambhavi966@gmail.com>
 * source_url: https://github.com/shambhavi/blast-radius
 * metadata:
 *   rote_version: 0.79.0
 *   version: 0.1.2
 *   status: released
 *   kind: atomic
 *   flow_type: parallel
 *   execution_model: steps_with_presentation
 *   contract:
 *     atomic: true
 *     input:
 *       type: parameters
 *     output:
 *       format: json
 *       destination: stdout
 *     composable: true
 *   format: typescript
 *   requires_endpoints:
 *   - github
 *   adapter_sources:
 *     github: pumpurlabs/github
 *   requires_sessions: true
 *   mcp_servers:
 *     github:
 *       fingerprint: mcp_AFzkNmxTeNYBrCVVszZT58mhxCB
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
 *       captured_at: 2026-09-03T11:31:40.914460+00:00
 *   discoverability:
 *     tags:
 *     - typescript
 *     - impact-analysis
 *     - developer-tools
 *     - github
 * tags:
 * - typescript
 * - impact-analysis
 * - developer-tools
 * - github
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
 * - name: pr_number
 *   param_type: string
 *   required: true
 *   default: 'null'
 *   description: Pull request number
 * steps:
 *   fetch_data:
 *     endpoint: adapter/github
 *     method: pulls/get
 *     params:
 *       owner: $owner
 *       repo: $repo
 *       pull_number: $pr_number
 *   process_data:
 *     endpoint: adapter/github
 *     method: pulls/list-files
 *     depends_on:
 *     - fetch_data
 *     params:
 *       owner: $owner
 *       repo: $repo
 *       pull_number: $pr_number
 *       per_page: 100
 * ---
 *
 * Usage:
 *   rote play run ~/.rote/flows/blast-radius/main.ts owner=VALUE repo=VALUE pr_number=VALUE
 *
 * Parameters:
 *   owner - GitHub repository owner or organization (default: null)
 *   repo - GitHub repository name (default: null)
 *   pr_number - Pull request number (default: null)
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

out.human("Blast Radius");
out.human("Analyze a GitHub pull request and identify its potential blast radius from evidence in the repository.");
out.human("Rendered fetch_data and process_data.");
out.summary("Blast Radius: rendered 2 step(s)");
out.result({
  run_id: ctx.run.run_id,
  steps: {
    "fetch_data": fetchData.body,
    "process_data": processData.body,
  },
});
