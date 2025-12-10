# dbt MCP Setup Guide for VS Code

## ✅ Prerequisites Installed
- ✅ Python 3.12.3
- ✅ dbt-core 1.10.15
- ✅ dbt adapters (postgres, bigquery, snowflake)
- ✅ uvx (package runner)

## 🔧 Configuration Steps

### Step 1: Enable MCP in VS Code

1. Open VS Code Settings (`Ctrl+,` or `Cmd+,`)
2. Select the **User** or **Workspace** tab at the top
3. Navigate to **Features** → **Chat**
4. Ensure **MCP** is **Enabled** ✓

### Step 2: Create MCP Configuration

1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)

2. Run command: **`MCP: Open User Configuration`**
   - For user-wide configuration (recommended)
   
   OR
   
   **`MCP: Open Workspace Folder MCP Configuration`**
   - For workspace-specific configuration

3. This will create/open an `mcp.json` file

4. Copy the configuration below into the file:

```json
{
  "mcpServers": {
    "dbt": {
      "command": "/home/codespace/.local/bin/uvx",
      "args": ["dbt-mcp"],
      "env": {
        "DBT_HOST": "https://YOUR-DBT-HOST.getdbt.com",
        "DBT_PROJECT_DIR": "/workspaces/portfolio-gcp",
        "DBT_PATH": "/workspaces/portfolio-gcp/.venv/bin/dbt"
      }
    }
  }
}
```

5. **IMPORTANT**: Replace `YOUR-DBT-HOST.getdbt.com` with your actual dbt host
   - Find this in your dbt account under **Account Settings** → **Access URLs**
   - Example: `https://abc123.us1.dbt.com` or `https://cloud.getdbt.com`

### Step 3: Save and Reload

1. Save the `mcp.json` file (`Ctrl+S` or `Cmd+S`)

2. Reload VS Code window:
   - Open Command Palette (`Ctrl+Shift+P`)
   - Run: **`Developer: Reload Window`**

### Step 4: Verify Installation

1. Open Command Palette (`Ctrl+Shift+P`)

2. Run: **`MCP: List Servers`**

3. You should see **dbt** server listed

4. Click on the server to see status and logs

### Step 5: Start Using dbt MCP

Once configured, you can access dbt MCP through:

- **GitHub Copilot Chat** in VS Code
- **VS Code Chat** interface
- Inline suggestions and AI assistance

The MCP server provides:
- ✅ dbt CLI commands
- ✅ Discovery API access
- ✅ Semantic Layer queries
- ✅ Job management
- ✅ Project insights

## 🎯 What You Get

### Platform Features (via OAuth)
- Access to dbt Discovery API
- Query the Semantic Layer
- Manage and monitor jobs
- Browse project metadata

### CLI Features (Local)
- Run dbt commands (compile, run, test, etc.)
- Access to dbt documentation
- Local project operations
- Full dbt Core functionality

## 📝 Your Configuration Details

```
DBT_PROJECT_DIR: /workspaces/portfolio-gcp
DBT_PATH: /workspaces/portfolio-gcp/.venv/bin/dbt
UVX_PATH: /home/codespace/.local/bin/uvx
```

## 🔍 Troubleshooting

### Cannot find uvx executable
If VS Code can't find `uvx`, use the full path in your `mcp.json`:
```json
"command": "/home/codespace/.local/bin/uvx"
```

### Server not starting
1. Run `MCP: List Servers` from Command Palette
2. Check for error messages
3. View detailed logs by clicking on the server
4. Verify your `DBT_HOST` URL is correct

### OAuth Issues
- Ensure you're logged into your dbt account in the browser
- Check that your dbt trial/subscription is active
- Verify the `DBT_HOST` matches your account's access URL

### CLI Commands Not Working
- Verify dbt is installed: `/workspaces/portfolio-gcp/.venv/bin/dbt --version`
- Check `DBT_PROJECT_DIR` points to a valid dbt project
- Ensure your project has a `dbt_project.yml` file

## 🆘 Need Help?

- Check MCP server logs: Command Palette → `MCP: List Servers` → Click on dbt server
- Verify installation: Run `which uvx` and `which dbt` in terminal
- Consult dbt MCP documentation: https://docs.getdbt.com/docs/dbt-ai/integrate-mcp-vscode

## 📚 Next Steps

1. Set up your dbt project (if not already done)
2. Configure your `profiles.yml` with database credentials
3. Start using AI-powered dbt assistance in VS Code!

---

**Sample Configuration Reference**: See `mcp-config-sample.json` in this directory
