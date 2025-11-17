#!/bin/bash

# Setup Cloud Build trigger for automatic deployments

set -e

PROJECT_ID="${GCP_PROJECT_ID}"
REPO_OWNER="${GITHUB_REPO_OWNER}"
REPO_NAME="${GITHUB_REPO_NAME:-portfolio-gcp}"
TRIGGER_NAME="portfolio-backend-deploy"

echo "=== Setting up Cloud Build Trigger ==="
echo "Project: $PROJECT_ID"
echo "Repository: $REPO_OWNER/$REPO_NAME"
echo ""

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com --project="$PROJECT_ID"

# Connect GitHub repository (manual step required)
echo "To connect your GitHub repository:"
echo "1. Go to: https://console.cloud.google.com/cloud-build/triggers/connect?project=$PROJECT_ID"
echo "2. Select 'GitHub' as the source"
echo "3. Authenticate and select your repository: $REPO_OWNER/$REPO_NAME"
echo ""
read -p "Press enter after connecting the repository..."

# Create trigger
gcloud builds triggers create github \
    --name="$TRIGGER_NAME" \
    --repo-name="$REPO_NAME" \
    --repo-owner="$REPO_OWNER" \
    --branch-pattern="^main$" \
    --build-config="cloudbuild.yaml" \
    --project="$PROJECT_ID" \
    --substitutions="_REGION=us-central1,_SERVICE_NAME=portfolio-backend,_ENVIRONMENT=production,_MIN_INSTANCES=1,_MAX_INSTANCES=10"

echo ""
echo "✓ Cloud Build trigger created: $TRIGGER_NAME"
echo ""
echo "The trigger will run on pushes to the 'main' branch."
echo "View triggers: https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID"
