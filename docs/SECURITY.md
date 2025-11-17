# Security Best Practices

## Overview

This document outlines the security measures implemented in the portfolio backend and best practices for maintaining security in production.

## Implemented Security Measures

### 1. Application Security

#### Helmet.js Security Headers

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

**Headers Set**:
- `Content-Security-Policy`: Prevents XSS attacks
- `X-Frame-Options: DENY`: Prevents clickjacking
- `X-Content-Type-Options: nosniff`: Prevents MIME sniffing
- `Strict-Transport-Security`: Enforces HTTPS
- `X-XSS-Protection`: Additional XSS protection

#### CORS Configuration

```typescript
app.use(cors({
  origin: config.allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

### 2. Rate Limiting

#### General Rate Limiting

```typescript
// 100 requests per 15 minutes per IP
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
```

#### Contact Form Rate Limiting

```typescript
// 5 submissions per 15 minutes per IP
const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});
```

### 3. Input Validation

Using `express-validator` for all user inputs:

```typescript
[
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail(),
  body('message')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .escape(),
]
```

**Validation Rules**:
- Email format validation
- String length limits
- HTML escaping
- Normalization

### 4. Container Security

#### Non-Root User

```dockerfile
# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Switch to non-root user
USER nodejs
```

#### Minimal Base Image

```dockerfile
FROM node:18-alpine
```

**Benefits**:
- Smaller attack surface
- Fewer vulnerabilities
- Faster builds

#### Security Scanning

```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    format: 'sarif'
```

### 5. Secret Management

#### Using Google Secret Manager

```bash
# Store secret
echo -n "secret-value" | gcloud secrets create secret-name \
  --data-file=- \
  --replication-policy="automatic"

# Use in Cloud Run
gcloud run services update SERVICE_NAME \
  --update-secrets=ENV_VAR=secret-name:latest
```

**Never**:
- Commit secrets to Git
- Hardcode API keys
- Log sensitive data
- Use default passwords

**Always**:
- Use Secret Manager
- Rotate secrets regularly
- Use least privilege access
- Audit secret access

### 6. HTTPS Enforcement

Cloud Run provides automatic HTTPS:
- Managed SSL certificates
- TLS 1.2+ only
- Automatic renewal
- HTTP to HTTPS redirect

### 7. Authentication & Authorization

#### Implementing JWT Authentication (Example)

```typescript
import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Protected route
app.get('/admin/data', authenticateToken, (req, res) => {
  // Only accessible with valid token
});
```

## Cloud Security

### 1. IAM (Identity and Access Management)

#### Principle of Least Privilege

```bash
# Grant only necessary permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT" \
  --role="roles/run.invoker"
```

#### Service Account Permissions

```bash
# Cloud Run service account needs:
- roles/run.invoker (for invoking)
- roles/storage.objectViewer (for reading from GCS)
- roles/secretmanager.secretAccessor (for secrets)
```

### 2. Cloud Armor (DDoS Protection)

```bash
# Create security policy
gcloud compute security-policies create portfolio-policy \
  --description="DDoS protection for portfolio backend"

# Add rate limiting rule
gcloud compute security-policies rules create 1000 \
  --security-policy=portfolio-policy \
  --expression="true" \
  --action=rate-based-ban \
  --rate-limit-threshold-count=100 \
  --rate-limit-threshold-interval-sec=60 \
  --ban-duration-sec=600

# Attach to backend service
gcloud compute backend-services update BACKEND_SERVICE \
  --security-policy=portfolio-policy
```

### 3. VPC Service Controls

For enhanced isolation:

```bash
# Create service perimeter
gcloud access-context-manager perimeters create portfolio-perimeter \
  --title="Portfolio Backend Perimeter" \
  --resources=projects/PROJECT_NUMBER \
  --restricted-services=run.googleapis.com,storage.googleapis.com
```

### 4. Cloud Audit Logging

Enable audit logs for compliance:

```bash
# View audit logs
gcloud logging read "protoPayload.methodName=SetIamPolicy" \
  --limit=50
```

## Network Security

### 1. Ingress Control

```bash
# Restrict ingress to internal and Cloud Load Balancing
gcloud run services update SERVICE_NAME \
  --ingress=internal-and-cloud-load-balancing
```

Options:
- `all`: Public access (default)
- `internal`: VPC only
- `internal-and-cloud-load-balancing`: VPC + Load Balancer

### 2. Egress Control

```bash
# Use VPC connector for private access
gcloud compute networks vpc-access connectors create portfolio-connector \
  --network=default \
  --region=REGION \
  --range=10.8.0.0/28

# Update Cloud Run service
gcloud run services update SERVICE_NAME \
  --vpc-connector=portfolio-connector \
  --vpc-egress=private-ranges-only
```

## Data Security

### 1. Encryption at Rest

- **Cloud Run**: Automatic encryption
- **Cloud Storage**: Automatic encryption with Google-managed keys
- **Secrets**: Automatic encryption in Secret Manager

### 2. Encryption in Transit

- **HTTPS Only**: All traffic encrypted with TLS 1.2+
- **Internal**: Service-to-service encryption

### 3. Data Sanitization

```typescript
// Sanitize user input
import DOMPurify from 'isomorphic-dompurify';

const sanitizedInput = DOMPurify.sanitize(userInput);
```

## Monitoring & Alerting

### 1. Security Monitoring

```bash
# Create log sink for security events
gcloud logging sinks create security-events \
  storage.googleapis.com/BUCKET_NAME \
  --log-filter='severity>=ERROR OR protoPayload.authenticationInfo.principalEmail!=""'
```

### 2. Alert Policies

```bash
# Alert on failed authentication attempts
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Failed Auth Attempts" \
  --condition-filter='resource.type="cloud_run_revision" AND severity="WARNING" AND textPayload=~"401"'
```

### 3. Security Dashboards

Monitor:
- Failed authentication attempts
- Rate limit violations
- Unusual traffic patterns
- Error rates
- Geographic anomalies

## Vulnerability Management

### 1. Dependency Scanning

```bash
# Audit npm dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check for updates
npm outdated
```

### 2. Container Scanning

```bash
# Scan with Trivy
trivy image IMAGE_NAME

# Scan with Google Container Analysis
gcloud container images scan IMAGE_NAME
```

### 3. Update Strategy

1. **Weekly**: Check for security updates
2. **Monthly**: Update all dependencies
3. **Immediately**: Apply critical security patches

## Incident Response

### 1. Incident Detection

- Monitor error logs
- Set up alerting
- Review metrics regularly
- Automated scanning

### 2. Response Plan

1. **Identify**: Determine scope and impact
2. **Contain**: Isolate affected systems
3. **Eradicate**: Remove threat
4. **Recover**: Restore normal operations
5. **Learn**: Post-mortem analysis

### 3. Emergency Procedures

```bash
# Immediately stop service
gcloud run services update SERVICE_NAME \
  --max-instances=0

# Roll back to previous version
gcloud run services update-traffic SERVICE_NAME \
  --to-revisions=PREVIOUS_REVISION=100

# Investigate logs
gcloud logging read "resource.type=cloud_run_revision" \
  --limit=1000 \
  --format=json > incident-logs.json
```

## Compliance

### 1. GDPR Compliance

- User data encryption
- Right to deletion
- Data portability
- Privacy by design
- Audit trails

### 2. Data Retention

```bash
# Set bucket lifecycle policy
cat > lifecycle.json <<EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 90}
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://BUCKET_NAME
```

## Security Checklist

### Pre-Deployment

- [ ] All dependencies updated
- [ ] Security audit passed
- [ ] Secrets in Secret Manager
- [ ] Environment variables configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Container scanned

### Post-Deployment

- [ ] HTTPS enforced
- [ ] SSL certificate valid
- [ ] Rate limiting working
- [ ] Monitoring enabled
- [ ] Alerts configured
- [ ] Audit logging enabled
- [ ] Backup strategy in place
- [ ] Incident response plan documented
- [ ] Security testing completed
- [ ] Compliance requirements met

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [Cloud Run Security](https://cloud.google.com/run/docs/securing/overview)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

## Reporting Security Issues

If you discover a security vulnerability, please email security@yourdomain.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

Do not open a public GitHub issue for security vulnerabilities.

---

Security is an ongoing process. Regular audits, updates, and monitoring are essential.
