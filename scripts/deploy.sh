#!/bin/bash

# Portfolio Backend - Google Cloud Run Deployment Script
# This script handles the complete deployment process to Google Cloud Run

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-portfolio-backend}"
IMAGE_NAME="${IMAGE_NAME:-portfolio-backend}"
ARTIFACT_REGISTRY_REPO="${ARTIFACT_REGISTRY_REPO:-portfolio-images}"

# Validate required environment variables
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: GCP_PROJECT_ID environment variable is not set${NC}"
    exit 1
fi

echo -e "${GREEN}=== Portfolio Backend Deployment ===${NC}"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo ""

# Function to print section headers
print_section() {
    echo -e "\n${YELLOW}>>> $1${NC}\n"
}

# 1. Enable required APIs
print_section "Enabling required Google Cloud APIs"
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    compute.googleapis.com \
    secretmanager.googleapis.com \
    storage.googleapis.com \
    --project="$PROJECT_ID"

# 2. Create Artifact Registry repository (if not exists)
print_section "Setting up Artifact Registry"
if ! gcloud artifacts repositories describe "$ARTIFACT_REGISTRY_REPO" \
    --location="$REGION" \
    --project="$PROJECT_ID" &>/dev/null; then
    
    echo "Creating Artifact Registry repository..."
    gcloud artifacts repositories create "$ARTIFACT_REGISTRY_REPO" \
        --repository-format=docker \
        --location="$REGION" \
        --description="Portfolio backend container images" \
        --project="$PROJECT_ID"
else
    echo "Artifact Registry repository already exists"
fi

# 3. Configure Docker authentication
print_section "Configuring Docker authentication"
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# 4. Build and tag the image
print_section "Building Docker image"
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REGISTRY_REPO}/${IMAGE_NAME}:latest"
COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "local")
IMAGE_TAG_SHA="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REGISTRY_REPO}/${IMAGE_NAME}:${COMMIT_SHA}"

docker build -t "$IMAGE_TAG" -t "$IMAGE_TAG_SHA" .

# 5. Push to Artifact Registry
print_section "Pushing image to Artifact Registry"
docker push "$IMAGE_TAG"
docker push "$IMAGE_TAG_SHA"

# 6. Deploy to Cloud Run
print_section "Deploying to Cloud Run"

# Create or update the service
gcloud run deploy "$SERVICE_NAME" \
    --image="$IMAGE_TAG" \
    --platform=managed \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --allow-unauthenticated \
    --port=8080 \
    --cpu=1 \
    --memory=512Mi \
    --min-instances=0 \
    --max-instances=10 \
    --concurrency=80 \
    --timeout=300 \
    --set-env-vars="NODE_ENV=production" \
    --set-env-vars="PORT=8080" \
    --set-env-vars="GCP_PROJECT_ID=${PROJECT_ID}" \
    --set-env-vars="GCP_REGION=${REGION}" \
    --ingress=all \
    --cpu-boost \
    --session-affinity

# 7. Get service URL
print_section "Deployment Complete"
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
    --platform=managed \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --format="value(status.url)")

echo -e "${GREEN}✓ Service deployed successfully!${NC}"
echo -e "${GREEN}✓ Service URL: $SERVICE_URL${NC}"
echo ""
echo "Next steps:"
echo "1. Configure custom domain (optional)"
echo "2. Set up Cloud CDN for static assets"
echo "3. Configure environment variables via Secret Manager"
echo "4. Set up Cloud Monitoring and Logging"
echo ""
echo "Test the deployment:"
echo "  curl ${SERVICE_URL}/health"
echo "  curl ${SERVICE_URL}/api/portfolio"
