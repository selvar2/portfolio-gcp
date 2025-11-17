# GitHub Secrets Setup Guide

This guide explains how to configure GitHub Secrets for automated deployments to Google Cloud Run.

## Prerequisites

- A Google Cloud Platform account
- A GCP project (e.g., `alien-scope-478416-c6`)
- Repository access to configure secrets

## Required Secrets

You need to configure **2 secrets** for the simplified deployment workflow:

### 1. GCP_PROJECT_ID

Your Google Cloud Project ID.

- **Name:** `GCP_PROJECT_ID`
- **Value:** `alien-scope-478416-c6`

### 2. GCP_SA_KEY

A service account JSON key with permissions to deploy to Cloud Run.

## Step-by-Step Setup

### Step 1: Create a Service Account

Run these commands on a machine with `gcloud` CLI installed:

```bash
# Set your project ID
export PROJECT_ID="alien-scope-478416-c6"

# Set the project
gcloud config set project $PROJECT_ID

# Create a service account for GitHub Actions
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployment" \
  --description="Service account for automated deployments from GitHub Actions"

# Get the service account email
export SA_EMAIL="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"
echo "Service Account Email: $SA_EMAIL"
```

### Step 2: Grant Required Permissions

```bash
# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

# Grant Service Account User role (required to deploy as the runtime service account)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

# Grant Artifact Registry Writer role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/artifactregistry.writer"

# Grant Storage Admin role (for Cloud Storage access if needed)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/storage.admin"

# Grant Logging Writer role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/logging.logWriter"
```

### Step 3: Create and Download the Service Account Key

```bash
# Create a JSON key
gcloud iam service-accounts keys create ~/github-actions-key.json \
  --iam-account=$SA_EMAIL

# Display the key (you'll copy this to GitHub)
cat ~/github-actions-key.json
```

**⚠️ IMPORTANT:** This key provides full access to your GCP resources. Keep it secure!

### Step 4: Enable Required GCP APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Artifact Registry API
gcloud services enable artifactregistry.googleapis.com

# Enable Cloud Build API (optional, for Cloud Build deployments)
gcloud services enable cloudbuild.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com

# Enable Secret Manager API (if using secrets)
gcloud services enable secretmanager.googleapis.com
```

### Step 5: Create Artifact Registry Repository

```bash
# Create a Docker repository in Artifact Registry
gcloud artifacts repositories create portfolio-images \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker images for portfolio backend"
```

### Step 6: Configure GitHub Secrets

1. **Go to your GitHub repository:** https://github.com/selvar2/portfolio-gcp

2. **Navigate to Settings → Secrets and variables → Actions**

3. **Click "New repository secret"**

4. **Add the first secret:**
   - Name: `GCP_PROJECT_ID`
   - Value: `alien-scope-478416-c6`
   - Click "Add secret"

5. **Add the second secret:**
   - Name: `GCP_SA_KEY`
   - Value: Copy the **entire contents** of the `github-actions-key.json` file (including the curly braces)
   - Click "Add secret"

### Step 7: Verify Configuration

After configuring the secrets:

1. Push code to the `main` branch
2. Go to the "Actions" tab in your GitHub repository
3. Watch the workflow run
4. The deployment should complete successfully

## Security Best Practices

### Rotate Keys Regularly

Service account keys should be rotated periodically:

```bash
# List existing keys
gcloud iam service-accounts keys list --iam-account=$SA_EMAIL

# Delete old key (replace KEY_ID with actual ID)
gcloud iam service-accounts keys delete KEY_ID --iam-account=$SA_EMAIL

# Create new key
gcloud iam service-accounts keys create ~/new-github-actions-key.json \
  --iam-account=$SA_EMAIL
```

Then update the `GCP_SA_KEY` secret in GitHub with the new key content.

### Least Privilege Principle

The permissions granted above are necessary for deployment. Review and adjust based on your specific needs:

- If you don't need Cloud Storage, remove `roles/storage.admin`
- Consider using custom roles with minimal permissions

### Key Storage

- **Never commit** the service account key to your repository
- **Delete the local key** after uploading to GitHub:
  ```bash
  rm ~/github-actions-key.json
  ```

## Troubleshooting

### "Permission denied" errors

Verify the service account has the correct roles:
```bash
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:$SA_EMAIL"
```

### "Artifact Registry not found" errors

Ensure the repository exists:
```bash
gcloud artifacts repositories list --location=us-central1
```

### "API not enabled" errors

Enable the required API:
```bash
gcloud services enable <api-name>.googleapis.com
```

## Alternative: Workload Identity Federation (More Secure)

For enhanced security, consider using Workload Identity Federation instead of service account keys. This eliminates the need to store long-lived credentials.

See the original `deploy.yml` workflow file or GCP documentation for setup instructions.

## Next Steps

After configuring secrets:

1. ✅ Merge your `sample` branch to `main`
2. ✅ GitHub Actions will automatically deploy to Cloud Run
3. ✅ Visit the Cloud Run service URL to see your portfolio backend live
4. Configure a custom domain (optional)
5. Set up Cloud CDN for static assets (optional)

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
