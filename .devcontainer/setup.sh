#!/bin/bash
set -e

echo "🚀 Setting up Claude CLI and dependencies..."

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    echo "📝 Loading environment variables..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if Claude CLI is already installed
if command -v claude &> /dev/null; then
    echo "✅ Claude CLI already installed!"
    claude --version
else
    # Install Claude CLI using the official installer
    echo "📦 Installing Claude CLI..."
    curl -fsSL https://claude.ai/install.sh | bash

    # Add to PATH for current session
    export PATH="$HOME/.local/bin:$PATH"

    # Verify installation
    if command -v claude &> /dev/null; then
        echo "✅ Claude CLI installed successfully!"
        claude --version
    else
        echo "⚠️  Claude CLI installed but not in PATH yet. Restart your terminal."
    fi
fi

# Configure Claude CLI with API key if available
if [ ! -z "$ANTHROPIC_API_KEY" ]; then
    echo "🔑 Configuring Anthropic API key..."

    # Create Claude config directory if it doesn't exist
    mkdir -p ~/.config/claude

    # Set the API key for Claude CLI
    cat > ~/.config/claude/config.json <<EOF
{
  "apiKey": "$ANTHROPIC_API_KEY"
}
EOF

    echo "✅ API key configured successfully!"
else
    echo "⚠️  No ANTHROPIC_API_KEY found. Claude CLI will need authentication."
fi

# Install any project dependencies
if [ -f "package.json" ]; then
    echo "📦 Installing project dependencies..."
    npm install
fi

echo "✨ Setup complete! Claude CLI is ready to use."
