# Pre-Deployment Checklist

Use this checklist before deploying to production.

## ☑️ Code Quality

- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Code formatted (`npm run format`)
- [ ] No console.log statements (use logger instead)
- [ ] Error handling implemented for all routes
- [ ] Input validation on all endpoints

## ☑️ Configuration

- [ ] Environment variables configured
- [ ] GCP_PROJECT_ID set correctly
- [ ] GCP_REGION set correctly
- [ ] ALLOWED_ORIGINS configured for production
- [ ] Rate limiting configured appropriately
- [ ] Cache settings optimized
- [ ] Contact email configured

## ☑️ Security

- [ ] All secrets in Secret Manager (not in code)
- [ ] No hardcoded credentials
- [ ] Security headers enabled (Helmet.js)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Container runs as non-root user
- [ ] Dependencies scanned for vulnerabilities (`npm audit`)
- [ ] Docker image scanned (Trivy)

## ☑️ Google Cloud Setup

- [ ] GCP project created
- [ ] Billing enabled
- [ ] Required APIs enabled
- [ ] Artifact Registry repository created
- [ ] Cloud Storage bucket created (if needed)
- [ ] Service account configured
- [ ] IAM permissions set correctly
- [ ] Secrets created in Secret Manager

## ☑️ Docker

- [ ] Dockerfile builds successfully
- [ ] Multi-stage build working
- [ ] Image size optimized
- [ ] Health check configured
- [ ] Environment variables properly set
- [ ] Port 8080 exposed
- [ ] .dockerignore configured

## ☑️ CI/CD

### GitHub Actions
- [ ] Workflow files present
- [ ] Workload Identity Federation configured
- [ ] GitHub secrets configured:
  - [ ] GCP_PROJECT_ID
  - [ ] WIF_PROVIDER
  - [ ] WIF_SERVICE_ACCOUNT
- [ ] Tests run in CI
- [ ] Deployment triggers on main branch

### Cloud Build (Alternative)
- [ ] cloudbuild.yaml configured
- [ ] Trigger created
- [ ] Build succeeds

## ☑️ Monitoring & Logging

- [ ] Structured logging implemented
- [ ] Log level appropriate for environment
- [ ] Cloud Logging enabled
- [ ] Monitoring metrics available
- [ ] Alert policies created:
  - [ ] High error rate
  - [ ] High latency
  - [ ] Memory usage
- [ ] Budget alerts configured

## ☑️ Performance

- [ ] Response times tested
- [ ] Concurrency settings configured
- [ ] Memory allocation appropriate
- [ ] CPU allocation appropriate
- [ ] Min/max instances set
- [ ] Timeout configured
- [ ] Cold start time acceptable (<1s)

## ☑️ Cloud Run Service

- [ ] Service name decided
- [ ] Region selected
- [ ] Port 8080 configured
- [ ] CPU: 1 vCPU
- [ ] Memory: 512 MiB
- [ ] Min instances: 0 (or 1 for production)
- [ ] Max instances: 10 (adjust as needed)
- [ ] Concurrency: 80
- [ ] Timeout: 300s
- [ ] Ingress: all (or restricted)
- [ ] Authentication: allow-unauthenticated (for public API)

## ☑️ Networking

- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate valid
- [ ] DNS records updated
- [ ] Cloud CDN configured (if needed)
- [ ] Load balancer configured (if using CDN)

## ☑️ Storage

- [ ] Cloud Storage bucket created
- [ ] Bucket permissions set
- [ ] CORS policy configured
- [ ] Lifecycle policy set (if applicable)
- [ ] Public access configured correctly

## ☑️ Documentation

- [ ] README.md updated with project info
- [ ] API documentation complete
- [ ] Deployment instructions clear
- [ ] Environment variables documented
- [ ] Architecture diagram included
- [ ] Troubleshooting guide available

## ☑️ Testing

### Local Testing
- [ ] Application runs locally
- [ ] All endpoints tested
- [ ] Health checks working
- [ ] Error handling tested
- [ ] Rate limiting tested

### Docker Testing
- [ ] Container builds
- [ ] Container runs
- [ ] Health checks pass in container
- [ ] Environment variables work

### Cloud Testing
- [ ] Service deploys successfully
- [ ] Service URL accessible
- [ ] Health endpoint returns 200
- [ ] API endpoints working
- [ ] Logs visible in Cloud Logging
- [ ] Metrics visible in Cloud Monitoring

## ☑️ Backup & Recovery

- [ ] Backup strategy defined
- [ ] Recovery procedure documented
- [ ] Data retention policy set
- [ ] Disaster recovery plan in place
- [ ] Rollback procedure tested

## ☑️ Cost Management

- [ ] Budget set in GCP
- [ ] Budget alerts configured
- [ ] Cost estimates reviewed
- [ ] Auto-scaling configured properly
- [ ] Scale-to-zero enabled (if appropriate)

## ☑️ Compliance

- [ ] Data privacy requirements met
- [ ] GDPR compliance (if applicable)
- [ ] Terms of service updated
- [ ] Privacy policy updated
- [ ] Cookie policy (if applicable)

## ☑️ Post-Deployment

- [ ] Service accessible at URL
- [ ] Health checks passing
- [ ] Logs streaming properly
- [ ] Metrics being collected
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] SSL certificate valid
- [ ] Custom domain working (if applicable)

## ☑️ Final Verification

\`\`\`bash
# Get service URL
SERVICE_URL=$(gcloud run services describe SERVICE_NAME \
  --region=REGION \
  --format='value(status.url)')

# Test endpoints
curl ${SERVICE_URL}/health
curl ${SERVICE_URL}/api/portfolio

# Check logs
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# Monitor service
gcloud run services describe SERVICE_NAME --region=REGION
\`\`\`

## 🎉 Ready to Deploy!

Once all items are checked, you're ready to deploy:

\`\`\`bash
./scripts/deploy.sh
\`\`\`

Or push to main branch to trigger CI/CD:

\`\`\`bash
git push origin main
\`\`\`

---

**Note**: Keep this checklist updated as your project evolves.
