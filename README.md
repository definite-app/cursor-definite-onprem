# Definite for Cursor

This Cursor plugin connects agents to the MCP server in a customer's own
Definite deployment. Small, always-on agent VMs can query the deployment
directly while the warehouse and storage remain in Definite.

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
  ~/.cursor/plugins/local/definite
```

Then restart Cursor or run **Developer: Reload Window**.

1. Open **Customize**, find **Definite**, and configure
   `DEFINITE_DEPLOYMENT_HOSTNAME`.
2. Enter the deployment hostname only, without `https://` or `/mcp`.
3. Select **Connect** on the MCP card, sign in to that Definite deployment,
   and approve access.
4. Ask the agent to use Definite, or verify the connection by asking it to call
   `list_integrations`.

Do not paste a `def_` token into the plugin configuration. When the OAuth
session expires, use **Connect** again.

## Marketplace

- Homepage: https://www.definite.app
- Repository / submit URL: https://github.com/definite-app/cursor-definite-onprem
- Required field: `DEFINITE_DEPLOYMENT_HOSTNAME`
- Auth: Cursor **Connect** card, then Definite OAuth consent

## Validate

```bash
node scripts/validate-plugin.mjs
```

## License

MIT
