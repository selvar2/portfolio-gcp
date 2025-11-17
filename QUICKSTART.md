# Project Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites Check

```bash
node --version  # Should be v18+
npm --version   # Should be v9+
docker --version  # Should be v20+
gcloud --version  # Install if needed
```

### 2. Local Development

```bash
# Clone and install
git clone https://github.com/yourusername/portfolio-gcp.git
cd portfolio-gcp
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run locally
npm run dev
```

Visit `http://localhost:8080/health` to verify.

### 3. Test the API

```bash
# Health check
curl http://localhost:8080/health

# Get portfolio data
curl http://localhost:8080/api/portfolio

# Get specific section
curl http://localhost:8080/api/portfolio/experience
```

### 4. Deploy to Google Cloud

```bash
# Set up GCP
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"

# One-command deployment
./scripts/deploy.sh
```

## 📝 Common Tasks

### Run Tests

```bash
npm test
npm test -- --coverage
npm test -- --watch
```

### Build for Production

```bash
npm run build
npm start
```

### Docker Build

```bash
docker build -t portfolio-backend .
docker run -p 8080:8080 --env-file .env portfolio-backend
```

### Update Service

```bash
# Make changes, then:
./scripts/deploy.sh
```

## 🔗 Key Endpoints

- **Health**: `/health`
- **Portfolio**: `/api/portfolio`
- **Contact**: `/api/contact` (POST)
- **Assets**: `/api/assets`

## 📚 Documentation

- [README.md](README.md) - Full documentation
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment guide
- [docs/SECURITY.md](docs/SECURITY.md) - Security best practices

## 🆘 Troubleshooting

### Port in use
```bash
lsof -ti:8080 | xargs kill -9
```

### Docker issues
```bash
docker system prune -a
```

### View logs
```bash
gcloud logging read "resource.type=cloud_run_revision" --limit=50
```

## 💡 Next Steps

1. Customize portfolio data in `src/services/portfolioService.ts`
2. Configure your domain
3. Set up monitoring alerts
4. Configure CI/CD with GitHub Actions
5. Enable Cloud CDN for better performance

---

**Need Help?** Check the [full README](README.md) or [open an issue](https://github.com/yourusername/portfolio-gcp/issues).
