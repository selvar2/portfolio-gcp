#!/bin/bash

# Setup script for Google Cloud secrets using Secret Manager

set -e

PROJECT_ID="${GCP_PROJECT_ID}"
REGION="${GCP_REGION:-us-central1}"

echo "=== Setting up Secret Manager ==="
echo "Project: $PROJECT_ID"
echo ""

# Enable Secret Manager API
echo "Enabling Secret Manager API..."
gcloud services enable secretmanager.googleapis.com --project="$PROJECT_ID"

# Create secrets
create_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if gcloud secrets describe "$secret_name" --project="$PROJECT_ID" &>/dev/null; then
        echo "Secret '$secret_name' already exists, adding new version..."
        echo -n "$secret_value" | gcloud secrets versions add "$secret_name" \
            --data-file=- \
            --project="$PROJECT_ID"
    else
        echo "Creating secret '$secret_name'..."
        echo -n "$secret_value" | gcloud secrets create "$secret_name" \
            --data-file=- \
            --replication-policy="automatic" \
            --project="$PROJECT_ID"
    fi
}

# Example: Create secrets (replace with your actual values)
# create_secret "contact-email" "your-email@example.com"
# create_secret "recaptcha-secret" "your-recaptcha-secret-key"
# create_secret "sendgrid-api-key" "your-sendgrid-api-key"

echo ""
echo "To create a secret, run:"
echo "  echo -n 'secret-value' | gcloud secrets create secret-name \\"
echo "    --data-file=- \\"
echo "    --replication-policy='automatic' \\"
echo "    --project='$PROJECT_ID'"
echo ""

# Grant Cloud Run service account access to secrets
SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

echo "Granting secret access to service account: $SERVICE_ACCOUNT"

# Example: Grant access to specific secrets
# gcloud secrets add-iam-policy-binding "contact-email" \
#     --member="serviceAccount:${SERVICE_ACCOUNT}" \
#     --role="roles/secretmanager.secretAccessor" \
#     --project="$PROJECT_ID"

echo ""
echo "✓ Secret Manager setup complete"
echo ""
echo "To use secrets in Cloud Run, update deployment with:"
echo "  --update-secrets=ENV_VAR_NAME=secret-name:latest"
