#!/bin/bash

# Cloud CDN Setup Script for Portfolio Backend
# This script configures Cloud CDN for static asset delivery

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PROJECT_ID="${GCP_PROJECT_ID}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-portfolio-backend}"
BUCKET_NAME="${GCS_BUCKET_NAME:-${PROJECT_ID}-portfolio-assets}"
NEG_NAME="${SERVICE_NAME}-neg"
BACKEND_SERVICE_NAME="${SERVICE_NAME}-backend"
URL_MAP_NAME="${SERVICE_NAME}-url-map"
TARGET_PROXY_NAME="${SERVICE_NAME}-proxy"
FORWARDING_RULE_NAME="${SERVICE_NAME}-forwarding-rule"
SSL_CERT_NAME="${SERVICE_NAME}-ssl-cert"

echo -e "${GREEN}=== Setting up Cloud CDN ===${NC}\n"

# 1. Create Cloud Storage bucket for static assets
echo -e "${YELLOW}>>> Creating Cloud Storage bucket${NC}\n"
if ! gsutil ls -b "gs://${BUCKET_NAME}" &>/dev/null; then
    gsutil mb -p "$PROJECT_ID" -l "$REGION" "gs://${BUCKET_NAME}"
    
    # Make bucket publicly readable (for public assets)
    gsutil iam ch allUsers:objectViewer "gs://${BUCKET_NAME}"
    
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
    gsutil cors set cors.json "gs://${BUCKET_NAME}"
    rm cors.json
    
    echo "Bucket created: gs://${BUCKET_NAME}"
else
    echo "Bucket already exists"
fi

# 2. Create Network Endpoint Group for Cloud Run
echo -e "\n${YELLOW}>>> Creating Network Endpoint Group${NC}\n"
gcloud compute network-endpoint-groups create "$NEG_NAME" \
    --region="$REGION" \
    --network-endpoint-type=serverless \
    --cloud-run-service="$SERVICE_NAME" \
    --project="$PROJECT_ID" \
    || echo "NEG already exists"

# 3. Reserve static IP address
echo -e "\n${YELLOW}>>> Reserving static IP address${NC}\n"
gcloud compute addresses create "${SERVICE_NAME}-ip" \
    --ip-version=IPV4 \
    --global \
    --project="$PROJECT_ID" \
    || echo "IP address already exists"

STATIC_IP=$(gcloud compute addresses describe "${SERVICE_NAME}-ip" \
    --global \
    --project="$PROJECT_ID" \
    --format="value(address)")

echo "Static IP: $STATIC_IP"

# 4. Create backend service
echo -e "\n${YELLOW}>>> Creating backend service${NC}\n"
gcloud compute backend-services create "$BACKEND_SERVICE_NAME" \
    --global \
    --load-balancing-scheme=EXTERNAL_MANAGED \
    --enable-cdn \
    --cache-mode=CACHE_ALL_STATIC \
    --default-ttl=3600 \
    --max-ttl=86400 \
    --client-ttl=3600 \
    --project="$PROJECT_ID" \
    || echo "Backend service already exists"

# Add the NEG to the backend service
gcloud compute backend-services add-backend "$BACKEND_SERVICE_NAME" \
    --global \
    --network-endpoint-group="$NEG_NAME" \
    --network-endpoint-group-region="$REGION" \
    --project="$PROJECT_ID" \
    || echo "Backend already added"

# 5. Create URL map
echo -e "\n${YELLOW}>>> Creating URL map${NC}\n"
gcloud compute url-maps create "$URL_MAP_NAME" \
    --default-service="$BACKEND_SERVICE_NAME" \
    --global \
    --project="$PROJECT_ID" \
    || echo "URL map already exists"

# 6. Create HTTP(S) target proxy
echo -e "\n${YELLOW}>>> Creating target proxy${NC}\n"

# For HTTPS (recommended), you need an SSL certificate
# Option 1: Google-managed certificate (requires domain)
# gcloud compute ssl-certificates create "$SSL_CERT_NAME" \
#     --domains="yourdomain.com,www.yourdomain.com" \
#     --global \
#     --project="$PROJECT_ID"
#
# gcloud compute target-https-proxies create "$TARGET_PROXY_NAME" \
#     --url-map="$URL_MAP_NAME" \
#     --ssl-certificates="$SSL_CERT_NAME" \
#     --global \
#     --project="$PROJECT_ID"

# Option 2: HTTP only (for testing)
gcloud compute target-http-proxies create "$TARGET_PROXY_NAME" \
    --url-map="$URL_MAP_NAME" \
    --global \
    --project="$PROJECT_ID" \
    || echo "Target proxy already exists"

# 7. Create forwarding rule
echo -e "\n${YELLOW}>>> Creating forwarding rule${NC}\n"
gcloud compute forwarding-rules create "$FORWARDING_RULE_NAME" \
    --load-balancing-scheme=EXTERNAL_MANAGED \
    --network-tier=PREMIUM \
    --address="${SERVICE_NAME}-ip" \
    --global \
    --target-http-proxy="$TARGET_PROXY_NAME" \
    --ports=80 \
    --project="$PROJECT_ID" \
    || echo "Forwarding rule already exists"

# For HTTPS:
# gcloud compute forwarding-rules create "${FORWARDING_RULE_NAME}-https" \
#     --load-balancing-scheme=EXTERNAL_MANAGED \
#     --network-tier=PREMIUM \
#     --address="${SERVICE_NAME}-ip" \
#     --global \
#     --target-https-proxy="$TARGET_PROXY_NAME" \
#     --ports=443 \
#     --project="$PROJECT_ID"

echo -e "\n${GREEN}✓ Cloud CDN setup complete!${NC}"
echo -e "\nAccess your service at: http://${STATIC_IP}"
echo -e "\nStatic assets bucket: gs://${BUCKET_NAME}"
echo -e "\nNote: For production, configure:"
echo "  1. Custom domain with SSL certificate"
echo "  2. Cloud Armor for DDoS protection"
echo "  3. Cloud Monitoring alerts"
