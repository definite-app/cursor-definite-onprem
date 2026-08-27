# Definite On-Prem for Cursor

This Cursor plugin connects agents to the MCP server in a customer's own
Definite on-prem deployment. Small, always-on agent VMs can query the
deployment directly while the lakehouse and storage remain in Definite.

The plugin includes:

- a required deployment-hostname setting;
- a remote MCP connector at `https://${DEFINITE_DEPLOYMENT_HOSTNAME}/mcp`;
- agent guidance for querying data, using governed metadata, building data
  apps, and running automations through MCP.

Authentication uses the deployment's OAuth 2.1 authorization-code flow with
PKCE. Cursor discovers OAuth from the MCP endpoint; the plugin does not accept
or store an API token.

## Local installation

Symlink the repository into Cursor's local plugin directory:

```bash
mkdir -p ~/.cursor/plugins/local
ln -s /absolute/path/to/cursor-definite-onprem \
  ~/.cursor/plugins/local/definite-onprem
```

Then restart Cursor or run **Developer: Reload Window**.

1. Open **Customize**, find **Definite On-Prem**, and configure
   `DEFINITE_DEPLOYMENT_HOSTNAME`.
2. Enter the deployment hostname only, without `https://` or `/mcp`.
3. Select **Connect** on the MCP card, sign in to that Definite deployment,
   and approve access.
4. Ask the agent to use Definite, or verify the connection by asking it to call
   `list_integrations`.

Do not paste a `def_` token into the plugin configuration. When the OAuth
session expires, use **Connect** again.

## Jane handoff

- Local plugin directory: `~/.cursor/plugins/local/definite-onprem`
- Required field: `DEFINITE_DEPLOYMENT_HOSTNAME`
- Auth: Cursor **Connect** card, then Definite OAuth consent
- Working one-line placeholder to rewrite: Connect Cursor agents to the
  lakehouse in your own Definite on-prem deployment.

This repository is the plugin source only. Marketplace submission and listing
copy are intentionally out of scope.

## Validate

```bash
node scripts/validate-plugin.mjs
```

## License

MIT
