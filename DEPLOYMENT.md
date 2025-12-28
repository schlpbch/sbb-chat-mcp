# GCP Cloud Run Deployment

This directory contains configuration and scripts for deploying the SBB Chat MCP application to Google Cloud Run.

## Quick Start

### 1. Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed and configured
- Project ID ready

### 2. Initial Setup

```bash
# Set your project ID
export GCP_PROJECT_ID="your-project-id"

# Run setup script
./scripts/setup-gcp.sh
```

### 3. Configure Secrets

```bash
# Update Gemini API key
echo -n 'YOUR_GEMINI_API_KEY' | gcloud secrets versions add gemini-api-key --data-file=-

# Update MCP server URL
echo -n 'https://your-mcp-server-url' | gcloud secrets versions add mcp-server-url --data-file=-
```

### 4. Deploy

```bash
# Deploy to Cloud Run
./scripts/deploy-gcp.sh
```

## Files Overview

- **Dockerfile** - Multi-stage build for production
- **cloudbuild.yaml** - Cloud Build configuration
- **scripts/setup-gcp.sh** - Initial GCP project setup
- **scripts/deploy-gcp.sh** - Manual deployment script
- **.github/workflows/deploy-cloud-run.yml** - CI/CD automation

## Configuration

### Resource Allocation

- Memory: 512Mi
- CPU: 1 vCPU
- Min instances: 0 (scales to zero)
- Max instances: 10
- Timeout: 300s

### Secrets (via Secret Manager)

- `GEMINI_API_KEY` - Google Gemini API key
- `MCP_SERVER_URL` - Journey Service MCP endpoint

## Manual Deployment

```bash
# Build and deploy in one command
gcloud builds submit --config cloudbuild.yaml
```

## CI/CD Setup

### GitHub Actions

1. Set up Workload Identity Federation
2. Add secrets to GitHub:
   - `GCP_PROJECT_ID`
   - `WIF_PROVIDER`
   - `WIF_SERVICE_ACCOUNT`
3. Push to `main` branch triggers automatic deployment

## Monitoring

View logs:

```bash
gcloud run services logs read sbb-chat-mcp --region europe-west6
```

View metrics in Cloud Console:
<https://console.cloud.google.com/run>

## Troubleshooting

### Build fails

- Check `gcloud builds log` for errors
- Verify `next.config.ts` has `output: 'standalone'`

### Deployment fails

- Verify secrets exist and have correct permissions
- Check service account IAM roles

### Cold starts too slow

- Increase `--min-instances` to 1
- Optimize Docker image size

## Cost Estimation

- Low traffic: ~$5-10/month
- Medium traffic: ~$20-50/month
- High traffic: ~$100-200/month

## Rollback

```bash
# List revisions
gcloud run revisions list --service sbb-chat-mcp --region europe-west6

# Rollback to specific revision
gcloud run services update-traffic sbb-chat-mcp \
  --to-revisions REVISION_NAME=100 \
  --region europe-west6
```

## Custom Domain

```bash
gcloud run domain-mappings create \
  --service sbb-chat-mcp \
  --domain chat.yourdomain.com \
  --region europe-west6
```

## Support

For detailed documentation, see: `/home/schlpbch/.gemini/antigravity/brain/f8b53291-e820-4b12-85a0-94a09b2acacb/gcp_cloud_run_plan.md`
