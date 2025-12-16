# Development Container Configuration

This directory contains the configuration for automatically setting up Claude CLI in GitHub Codespaces.

## What's Configured

### Automatic Installation
- **Claude CLI** (version 2.0.70+) - Installed automatically on every Codespace start
- **API Key** - Configured from environment variables (no manual setup needed)
- **MCP Servers** - GitHub MCP server pre-configured in `.mcp.json`
- **Project Dependencies** - npm packages installed automatically

### Files
- `devcontainer.json` - Codespace configuration with lifecycle hooks
- `setup.sh` - Automated setup script that runs on container start
- `README.md` - This file

## How API Keys Work

The API key is loaded automatically in this order:

1. **From `.env` file** (local development, already configured ✅)
2. **From Codespace Secrets** (optional, for additional security)

### Current Setup
Your API key is stored in `.env` (which is gitignored) and automatically loaded on every Codespace start.

### Optional: Add as Codespace Secret (Recommended for Teams)

For additional security, you can also set it as a Codespace secret:

1. Go to: https://github.com/settings/codespaces
2. Click "New secret"
3. Name: `ANTHROPIC_API_KEY`
4. Value: Your API key
5. Select repository access

This ensures the key is available even if `.env` is deleted.

## Lifecycle Scripts

- **onCreateCommand**: Runs during prebuild (for faster Codespace creation)
- **postCreateCommand**: Runs when container is first created
- **postStartCommand**: Runs every time you reopen the Codespace

All three run `setup.sh` to ensure Claude CLI is always ready.

## Troubleshooting

### Claude CLI not found
```bash
bash .devcontainer/setup.sh
```

### Check API key configuration
```bash
echo $ANTHROPIC_API_KEY
cat ~/.config/claude/config.json
```

### Verify Claude CLI
```bash
claude --version
claude mcp list
```

## What Gets Installed

1. Claude CLI (native binary)
2. API key configuration
3. Project npm dependencies
4. MCP server configurations

Everything is automated - you should never need to manually install anything!
