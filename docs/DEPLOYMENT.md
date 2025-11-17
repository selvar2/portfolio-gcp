# Deployment Guide

Complete guide for deploying the Portfolio Backend to Google Cloud Run.

## Prerequisites Checklist

- [ ] Google Cloud account with billing enabled
- [ ] gcloud CLI installed and configured
- [ ] Docker installed (for local testing)
- [ ] Git repository set up
- [ ] Domain name (optional, for custom domain)

## Initial Setup

### 1. Install and Configure gcloud CLI

```bash
# Install gcloud (if not already installed)
# Visit: https://cloud.google.com/sdk/docs/install

# Login to Google Cloud
gcloud auth login

# Set default project
export GCP_PROJECT_ID="your-project-id"
gcloud config set project ${GCP_PROJECT_ID}

# Set default region
export GCP_REGION="us-central1"
gcloud config set run/region ${GCP_REGION}
```

### 2. Enable Required APIs

```bash
# Enable all required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  compute.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com \
  cloudresourcemanager.googleapis.com \
  --project=${GCP_PROJECT_ID}
```

### 3. Set Up IAM Permissions

```bash
# Get your current user email
USER_EMAIL=$(gcloud config get-value account)

# Grant necessary roles
gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
  --member="user:${USER_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
  --member="user:${USER_EMAIL}" \
  --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
  --member="user:${USER_EMAIL}" \
  --role="roles/storage.admin"
```

## Method 1: Automated Deployment (Recommended)

### Using the Deployment Script

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/portfolio-gcp.git
cd portfolio-gcp

# 2. Set environment variables
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"
export SERVICE_NAME="portfolio-backend"

# 3. Make script executable (if not already)
chmod +x scripts/deploy.sh

# 4. Run deployment script
./scripts/deploy.sh
```

The script will:
1. Enable required APIs
2. Create Artifact Registry repository
3. Build Docker image
4. Push to Artifact Registry
5. Deploy to Cloud Run
6. Output the service URL

## Method 2: Manual Step-by-Step Deployment

### Step 1: Create Artifact Registry Repository

```bash
# Set variables
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"
export REPO_NAME="portfolio-images"

# Create repository
gcloud artifacts repositories create ${REPO_NAME} \
  --repository-format=docker \
  --location=${GCP_REGION} \
  --description="Portfolio backend container images" \
  --project=${GCP_PROJECT_ID}

# Configure Docker authentication
gcloud auth configure-docker ${GCP_REGION}-docker.pkg.dev
```

### Step 2: Build and Push Docker Image

```bash
# Set image variables
export SERVICE_NAME="portfolio-backend"
export IMAGE_TAG="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:latest"
export COMMIT_SHA=$(git rev-parse --short HEAD)
export IMAGE_TAG_SHA="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:${COMMIT_SHA}"

# Build image
docker build \
  -t ${IMAGE_TAG} \
  -t ${IMAGE_TAG_SHA} \
  --platform linux/amd64 \
  .

# Push both tags
docker push ${IMAGE_TAG}
docker push ${IMAGE_TAG_SHA}
```

### Step 3: Deploy to Cloud Run

```bash
gcloud run deploy ${SERVICE_NAME} \
  --image=${IMAGE_TAG} \
  --platform=managed \
  --region=${GCP_REGION} \
  --project=${GCP_PROJECT_ID} \
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
  --set-env-vars="GCP_PROJECT_ID=${GCP_PROJECT_ID}" \
  --set-env-vars="GCP_REGION=${GCP_REGION}" \
  --ingress=all \
  --cpu-boost \
  --session-affinity
```

### Step 4: Verify Deployment

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
  --platform=managed \
  --region=${GCP_REGION} \
  --project=${GCP_PROJECT_ID} \
  --format="value(status.url)")

echo "Service URL: ${SERVICE_URL}"

# Test health endpoint
curl ${SERVICE_URL}/health

# Test portfolio endpoint
curl ${SERVICE_URL}/api/portfolio
```

## Method 3: GitHub Actions CI/CD

### Prerequisites

1. **Set up Workload Identity Federation** (Recommended over service account keys)

```bash
# 1. Create Workload Identity Pool
gcloud iam workload-identity-pools create "github" \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# 2. Get the Workload Identity Pool ID
export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe "github" \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --format="value(name)")

# 3. Create Workload Identity Provider
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# 4. Create Service Account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Service Account" \
  --project=${GCP_PROJECT_ID}

export SERVICE_ACCOUNT_EMAIL="github-actions@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

# 5. Grant necessary roles to service account
gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

# 6. Allow GitHub to impersonate the service account
export REPO="yourusername/portfolio-gcp"

gcloud iam service-accounts add-iam-policy-binding ${SERVICE_ACCOUNT_EMAIL} \
  --project=${GCP_PROJECT_ID} \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${REPO}"

# 7. Get the Workload Identity Provider name
export WORKLOAD_IDENTITY_PROVIDER=$(gcloud iam workload-identity-pools providers describe "github-provider" \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github" \
  --format="value(name)")

echo "Add these to GitHub Secrets:"
echo "GCP_PROJECT_ID: ${GCP_PROJECT_ID}"
echo "WIF_PROVIDER: ${WORKLOAD_IDENTITY_PROVIDER}"
echo "WIF_SERVICE_ACCOUNT: ${SERVICE_ACCOUNT_EMAIL}"
```

### Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `GCP_PROJECT_ID`: Your GCP project ID
- `WIF_PROVIDER`: Workload Identity Provider (from step 7 above)
- `WIF_SERVICE_ACCOUNT`: Service account email

### Trigger Deployment

```bash
# Push to main branch
git add .
git commit -m "Deploy to production"
git push origin main

# Or manually trigger workflow
gh workflow run deploy.yml
```

## Method 4: Cloud Build

### Set Up Cloud Build Trigger

```bash
# Run setup script
./scripts/setup-cloud-build.sh

# Or manually create trigger
gcloud builds triggers create github \
  --name="portfolio-backend-deploy" \
  --repo-name="portfolio-gcp" \
  --repo-owner="yourusername" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml" \
  --project=${GCP_PROJECT_ID}
```

### Manual Cloud Build

```bash
# Submit build
gcloud builds submit \
  --config cloudbuild.yaml \
  --project=${GCP_PROJECT_ID}
```

## Post-Deployment Configuration

### 1. Set Up Cloud Storage for Assets

```bash
export GCS_BUCKET_NAME="${GCP_PROJECT_ID}-portfolio-assets"

# Create bucket
gsutil mb -p ${GCP_PROJECT_ID} -l ${GCP_REGION} gs://${GCS_BUCKET_NAME}

# Make bucket publicly readable (for public assets)
gsutil iam ch allUsers:objectViewer gs://${GCS_BUCKET_NAME}

# Set CORS policy
cat > cors.json <<EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Cache-Control"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://${GCS_BUCKET_NAME}
rm cors.json

# Update Cloud Run service with bucket name
gcloud run services update ${SERVICE_NAME} \
  --update-env-vars GCS_BUCKET_NAME=${GCS_BUCKET_NAME} \
  --region=${GCP_REGION} \
  --project=${GCP_PROJECT_ID}
```

### 2. Configure Secrets in Secret Manager

```bash
# Create secrets
echo -n "your-contact-email@example.com" | \
  gcloud secrets create contact-email \
  --data-file=- \
  --replication-policy="automatic" \
  --project=${GCP_PROJECT_ID}

echo -n "your-recaptcha-secret-key" | \
  gcloud secrets create recaptcha-secret \
  --data-file=- \
  --replication-policy="automatic" \
  --project=${GCP_PROJECT_ID}

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding contact-email \
  --member="serviceAccount:${GCP_PROJECT_ID}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=${GCP_PROJECT_ID}

gcloud secrets add-iam-policy-binding recaptcha-secret \
  --member="serviceAccount:${GCP_PROJECT_ID}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=${GCP_PROJECT_ID}

# Update Cloud Run to use secrets
gcloud run services update ${SERVICE_NAME} \
  --update-secrets=CONTACT_EMAIL=contact-email:latest \
  --update-secrets=RECAPTCHA_SECRET_KEY=recaptcha-secret:latest \
  --region=${GCP_REGION} \
  --project=${GCP_PROJECT_ID}
```

### 3. Set Up Cloud CDN (Optional)

```bash
# Run CDN setup script
./scripts/setup-cdn.sh

# This will:
# - Create Network Endpoint Group
# - Reserve static IP
# - Create backend service with CDN
# - Configure URL map and load balancer
```

### 4. Configure Custom Domain (Optional)

```bash
export DOMAIN="yourdomain.com"

# Map domain to service
gcloud run domain-mappings create \
  --service=${SERVICE_NAME} \
  --domain=${DOMAIN} \
  --region=${GCP_REGION} \
  --project=${GCP_PROJECT_ID}

# Get DNS records to configure
gcloud run domain-mappings describe \
  --domain=${DOMAIN} \
  --region=${GCP_REGION} \
  --project=${GCP_PROJECT_ID}

# Add the DNS records to your domain registrar
# Type: A
# Name: @
# Value: [IP from above command]
#
# Type: AAAA
# Name: @
# Value: [IPv6 from above command]
```

### 5. Enable Monitoring and Alerting

```bash
# Create log-based metric for errors
gcloud logging metrics create error_rate \
  --description="Rate of 5xx errors" \
  --log-filter='resource.type="cloud_run_revision" AND severity="ERROR"' \
  --project=${GCP_PROJECT_ID}

# Create notification channel (email)
gcloud alpha monitoring channels create \
  --display-name="Email Alerts" \
  --type=email \
  --channel-labels=email_address=your-email@example.com \
  --project=${GCP_PROJECT_ID}

# Get channel ID
CHANNEL_ID=$(gcloud alpha monitoring channels list \
  --filter='displayName="Email Alerts"' \
  --format='value(name)' \
  --project=${GCP_PROJECT_ID})

# Create alert policy
gcloud alpha monitoring policies create \
  --notification-channels=${CHANNEL_ID} \
  --display-name="High Error Rate" \
  --condition-threshold-value=10 \
  --condition-threshold-duration=300s \
  --condition-display-name="Error rate > 10/min" \
  --project=${GCP_PROJECT_ID}
```

## Updating the Service

### Rolling Update (Zero Downtime)

```bash
# Build new image
docker build -t ${IMAGE_TAG} .
docker push ${IMAGE_TAG}

# Deploy new revision
gcloud run deploy ${SERVICE_NAME} \
  --image=${IMAGE_TAG} \
  --region=${GCP_REGION} \
  --project=${GCP_PROJECT_ID}

# Traffic is automatically migrated to new revision
```

### Gradual Rollout

```bash
# Deploy new revision without traffic
gcloud run deploy ${SERVICE_NAME} \
  --image=${IMAGE_TAG} \
  --no-traffic \
  --tag=canary \
  --region=${GCP_REGION} \
  --project=${GCP_PROJECT_ID}

# Gradually shift traffic
gcloud run services update-traffic ${SERVICE_NAME} \
  --to-revisions=canary=10 \
  --region=${GCP_REGION} \
  --project=${GCP_PROJECT_ID}

# If successful, shift all traffic
gcloud run services update-traffic ${SERVICE_NAME} \
  --to-latest \
  --region=${GCP_REGION} \
  --project=${GCP_PROJECT_ID}
```

### Rollback

```bash
# List revisions
gcloud run revisions list \
  --service=${SERVICE_NAME} \
  --region=${GCP_REGION} \
  --project=${GCP_PROJECT_ID}

# Rollback to previous revision
gcloud run services update-traffic ${SERVICE_NAME} \
  --to-revisions=REVISION_NAME=100 \
  --region=${GCP_REGION} \
  --project=${GCP_PROJECT_ID}
```

## Troubleshooting Deployment

### Check Deployment Status

```bash
# View service details
gcloud run services describe ${SERVICE_NAME} \
  --region=${GCP_REGION} \
  --project=${GCP_PROJECT_ID}

# View latest logs
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE_NAME}" \
  --limit=50 \
  --project=${GCP_PROJECT_ID}

# Stream logs in real-time
gcloud alpha logging tail \
  "resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE_NAME}" \
  --project=${GCP_PROJECT_ID}
```

### Common Issues

1. **Permission Denied**:
   ```bash
   # Grant necessary IAM roles
   gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
     --member="user:$(gcloud config get-value account)" \
     --role="roles/run.admin"
   ```

2. **Image Not Found**:
   ```bash
   # List images in Artifact Registry
   gcloud artifacts docker images list \
     ${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${REPO_NAME}
   ```

3. **Service Not Responding**:
   ```bash
   # Check health endpoint
   curl $(gcloud run services describe ${SERVICE_NAME} \
     --region=${GCP_REGION} \
     --format='value(status.url)')/health
   ```

## Cost Management

### Monitor Costs

```bash
# View current month costs
gcloud billing accounts list

# Set up budget alerts
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Portfolio Backend Budget" \
  --budget-amount=50USD \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90
```

### Optimize Costs

1. **Scale to zero** when not in use (already configured)
2. **Use Cloud CDN** to reduce Cloud Run invocations
3. **Optimize container** for faster cold starts
4. **Set appropriate timeouts** to avoid long-running requests
5. **Use lifecycle policies** on Cloud Storage

---

Your portfolio backend is now deployed and ready for production use!
