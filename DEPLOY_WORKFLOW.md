# Deployment Workflow - GitHub → Cloud Build → Cloud Run

## Overview

This project uses **GitHub-triggered Cloud Build** for automatic deployments. When you push to the `main` branch, Cloud Build automatically builds and deploys your application to Cloud Run.

## ✅ What's Already Set Up

### 1. Infrastructure (Terraform)
- ✅ Cloud Run service (`sbb-chat-mcp-staging`)
- ✅ Artifact Registry repository (`sbb-chat`)
- ✅ Service Account with permissions
- ✅ Secrets (gemini-api-key, mcp-server-url)
- ✅ Cloud Build trigger (auto-deploy on push to main)

### 2. Cloud Build Configuration
- ✅ `cloudbuild.yaml` - Defines build steps
- ✅ `Dockerfile` - Multi-stage optimized build
- ✅ GitHub connected to Cloud Build
- ✅ Trigger created: Push to `main` → Auto-deploy

## 🚀 Deployment Flow

```
Developer
    ↓
  git push origin main
    ↓
GitHub Repository (schlpbch/sbb-chat-mcp)
    ↓
Cloud Build Trigger (automatic)
    ↓
Cloud Build Pipeline (cloudbuild.yaml)
    ├── Step 1: Install deps & run tests
    ├── Step 2: Build Docker image
    ├── Step 3: Push to Artifact Registry
    ├── Step 4: Deploy to Cloud Run
    └── Step 5: Verify deployment
    ↓
Cloud Run Service (sbb-chat-mcp-staging)
    ↓
Live URL: https://sbb-chat-mcp-staging-xxx.run.app
```

## 📝 How to Deploy

### Method 1: Push to GitHub (Recommended - Automated)

This is the standard workflow - just push your code!

```bash
# Make your changes
git add .
git commit -m "Your commit message"

# Push to main branch - this triggers automatic deployment
git push origin main
```

**What happens automatically:**
1. GitHub receives your push
2. Cloud Build trigger fires
3. Tests run (lint + unit tests)
4. Docker image builds
5. Image pushes to Artifact Registry
6. Cloud Run updates with new image
7. Health check verifies deployment
8. Done! (~3-5 minutes total)

### Method 2: Manual Trigger (Alternative)

Trigger a build manually without pushing:

```bash
gcloud builds triggers run sbb-chat-mcp-staging-trigger --region=europe-west6 --branch=main
```

### Method 3: Local Development Build (Testing Only)

For testing the build locally before pushing:

```bash
# Build locally
docker build -t europe-west6-docker.pkg.dev/journey-service-mcp/sbb-chat/sbb-chat-mcp:test .

# Test locally
docker run -p 8080:8080 europe-west6-docker.pkg.dev/journey-service-mcp/sbb-chat/sbb-chat-mcp:test
```

## 🎯 First Deployment

Since the Cloud Run service is currently waiting for the first image, you need to do an initial push:

```bash
# Ensure you're on the main branch
git branch

# Add all Terraform and config files
git add terraform/ cloudbuild.yaml

# Commit
git commit -m "feat: add Terraform infrastructure and auto-deploy configuration

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to trigger first deployment
git push origin main
```

Then monitor the build:

```bash
# Watch build logs in real-time
gcloud builds list --ongoing --region=europe-west6

# Get detailed logs for latest build
BUILD_ID=$(gcloud builds list --limit=1 --format='value(id)')
gcloud builds log $BUILD_ID --region=europe-west6 --stream
```

## 📊 Monitoring Deployments

### View Cloud Build History

```bash
# List recent builds
gcloud builds list --region=europe-west6 --limit=10

# Get build details
gcloud builds describe BUILD_ID --region=europe-west6
```

### View Cloud Run Service

```bash
# Get service URL
gcloud run services describe sbb-chat-mcp-staging --region=europe-west6 --format='value(status.url)'

# View recent logs
gcloud run services logs read sbb-chat-mcp-staging --region=europe-west6 --limit=50

# Check service status
gcloud run services describe sbb-chat-mcp-staging --region=europe-west6 --format='table(status.conditions.type, status.conditions.status, status.conditions.message)'
```

### Health Check

```bash
SERVICE_URL=$(gcloud run services describe sbb-chat-mcp-staging --region=europe-west6 --format='value(status.url)')
curl $SERVICE_URL/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-30T...",
  "version": "1.0.0"
}
```

## 🔧 Build Configuration

### cloudbuild.yaml Steps

1. **Test & Lint** (node:20)
   - Install dependencies with pnpm
   - Run ESLint
   - Run unit tests

2. **Build Docker Image** (docker)
   - Multi-stage build from Dockerfile
   - Tag with both git SHA and `latest`

3. **Push to Artifact Registry** (docker)
   - Push all tags to `europe-west6-docker.pkg.dev/journey-service-mcp/sbb-chat/sbb-chat-mcp`

4. **Deploy to Cloud Run** (gcloud)
   - Deploy with secrets from Secret Manager
   - Update to new image
   - Configure resources (512Mi, 1 CPU)
   - Set environment variables

5. **Verify Deployment** (bash)
   - Poll health endpoint (5 attempts)
   - Fail if service doesn't respond healthy

### Build Time
- **First build**: ~3-5 minutes (downloads dependencies)
- **Subsequent builds**: ~2-4 minutes (uses cache)

### Build Machine
- Type: `E2_HIGHCPU_8` (8 vCPU)
- Optimized for fast builds

## 🛠️ Troubleshooting

### Build Fails

```bash
# View failed build logs
gcloud builds list --filter='status=FAILURE' --region=europe-west6 --limit=5

# Get detailed error
BUILD_ID=<failed-build-id>
gcloud builds log $BUILD_ID --region=europe-west6
```

Common issues:
- **Test failures**: Fix failing tests before pushing
- **Lint errors**: Run `pnpm run lint --fix` locally
- **Docker build fails**: Check Dockerfile syntax
- **Permission denied**: Verify service account has proper roles

### Deployment Fails

```bash
# Check Cloud Run service status
gcloud run services describe sbb-chat-mcp-staging --region=europe-west6

# View recent deployment events
gcloud run revisions list --service=sbb-chat-mcp-staging --region=europe-west6 --limit=5
```

Common issues:
- **Image not found**: Build didn't complete successfully
- **Secrets missing**: Verify secrets exist in Secret Manager
- **Health check fails**: Check application logs for startup errors

### Trigger Not Firing

```bash
# Verify trigger exists
gcloud builds triggers list --region=europe-west6

# Check trigger configuration
gcloud builds triggers describe sbb-chat-mcp-staging-trigger --region=europe-west6
```

Common issues:
- **Wrong branch**: Trigger only fires on `main` branch
- **Files not matched**: Check `includedFiles` filter in trigger
- **GitHub connection lost**: Reconnect GitHub in Cloud Build UI

## 🔐 Security

### Secrets Management
- **Never commit secrets** to git
- **Use Secret Manager** for all sensitive values
- **Update secrets** via `gcloud secrets versions add`

### Service Account
- **Principle of least privilege**: Only necessary permissions
- **Dedicated SA**: `sbb-chat-mcp-staging-sa@journey-service-mcp.iam.gserviceaccount.com`
- **Roles**:
  - `secretmanager.secretAccessor` - Access secrets
  - Managed by Terraform

## 📈 Scaling

The Cloud Run service auto-scales based on traffic:
- **Min instances**: 0 (scales to zero when idle)
- **Max instances**: 10 (can handle bursts)
- **CPU**: 1 vCPU per instance
- **Memory**: 512Mi per instance
- **Timeout**: 300 seconds

To adjust scaling, update `terraform/terraform.tfvars` and run `terraform apply`.

## 💰 Cost Optimization

- **Scale to zero**: No cost when not in use
- **Pay per request**: Only charged for actual usage
- **Build caching**: Faster builds, lower costs
- **Artifact retention**: Automatic cleanup of old images

Expected costs:
- **Staging**: ~$10-30/month with moderate traffic
- **Builds**: First 120 min/day free, then $0.003/min

## 🎓 Best Practices

1. **Test locally first**: Run `pnpm run lint` and `pnpm run test` before pushing
2. **Small commits**: Easier to debug if something breaks
3. **Monitor builds**: Watch first build after changes
4. **Use branches**: Test in feature branches before merging to main
5. **Review logs**: Check Cloud Run logs after deployment
6. **Health checks**: Always verify `/api/health` responds

## 📚 Related Documentation

- [INFRASTRUCTURE.md](INFRASTRUCTURE.md) - Complete infrastructure documentation
- [terraform/README.md](terraform/README.md) - Terraform usage guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment documentation
- [cloudbuild.yaml](cloudbuild.yaml) - Build configuration
- [Dockerfile](Dockerfile) - Container configuration

## ✅ Quick Reference

```bash
# Deploy: Just push to main
git push origin main

# Monitor build
gcloud builds list --ongoing --region=europe-west6

# Get service URL
terraform output service_url

# Check health
curl $(terraform output -raw service_url)/api/health

# View logs
gcloud run services logs tail sbb-chat-mcp-staging --region=europe-west6

# Rollback (if needed)
gcloud run revisions list --service=sbb-chat-mcp-staging --region=europe-west6
gcloud run services update-traffic sbb-chat-mcp-staging --to-revisions=REVISION=100 --region=europe-west6
```

---

**🎉 You're all set!** Just push to `main` and Cloud Build handles the rest.
