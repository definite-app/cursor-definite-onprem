---
name: definite-onprem
description: Query and operate the customer's Definite on-prem lakehouse through its MCP tools. Use for data, SQL, semantic models, ontology, integrations, automations, and data apps.
---

# Definite On-Prem

Use the `definite` MCP server directly whenever the user asks about data or
operations in their Definite deployment. Grok Bot VMs and Cursor agents are
small and always on; the lakehouse and storage belong in the customer's own
Definite on-prem deployment, not in a central service.

## Agent-first workflow

- Call MCP tools to complete the task. Do not send the user to a web app as the
  normal next step.
- For open-ended business questions, start with `discover`.
- For a short identifier, categorical value, or ambiguous term, call
  `resolve_ontology` with the surrounding question as context. If it returns
  ambiguous confidence, show the alternatives and ask rather than guessing.
- Prefer governed ontology and semantic metadata before writing SQL. Use
  `search_ontology`, `describe_ontology_object`, `search_semantic`, and
  `describe_semantic_model` to find the intended concepts and grain.
- Prefer `run_semantic_query` for certified measures and dimensions. Use
  `run_sql_query` for row-level work, schema discovery, or ad hoc joins, and
  include a reasonable `LIMIT`.
- Use `list_integrations` and `get_integration` to inspect sources without
  exposing secrets. Use automation and authoring tools only when the user's
  request clearly calls for a write or run.
- Build and verify data apps through the MCP tools: scaffold, save, validate,
  and query their resources. Treat updating an existing app as an intentional
  write.

## Connection handling

The connector uses the deployment's OAuth 2.1 authorization-code flow with
PKCE. If the tools are unavailable or return `401`, ask the user to select
**Connect** on Cursor's MCP card, sign in to their deployment, and approve the
request. Never ask the user to paste a `def_` token into plugin configuration.

All calls run as the connected Definite user and must respect that user's
permissions.
