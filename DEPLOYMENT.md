# GCP Cloud Run Deployment

This directory contains configuration and scripts for deploying the Swiss Travel Companion application to Google Cloud Run.

## Deployment Methods

We offer two approaches to deploy your infrastructure:

### Method 1: Terraform (Recommended - Infrastructure as Code)

Terraform provides declarative, version-controlled infrastructure management.

**Quick Start:**

```bash
cd terraform
terraform init
terraform apply
```

**Documentation:**

- [Terraform Quick Start](terraform/QUICKSTART.md) - Get started in 10 minutes
- [Terraform README](terraform/README.md) - Full documentation
- [Migration Guide](terraform/MIGRATION_GUIDE.md) - Migrate from manual setup

**Advantages:**

- Infrastructure as code (version controlled)
- Reproducible deployments
- Easy multi-environment management
- State tracking and drift detection
- Team collaboration support

### Method 2: Manual Scripts (Legacy)

Traditional bash scripts for quick manual deployments.

**Quick Start:**

#### 1. Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed and configured
- Project ID ready

#### 2. Initial Setup

```bash
# Set your project ID
export GCP_PROJECT_ID="your-project-id"

# Run setup script
./scripts/setup-gcp.sh
```

#### 3. Configure Secrets

```bash
# Update Gemini API key
echo -n 'YOUR_GEMINI_API_KEY' | gcloud secrets versions add gemini-api-key --data-file=-

# Update MCP server URL
echo -n 'https://your-mcp-server-url' | gcloud secrets versions add mcp-server-url --data-file=-
```

#### 4. Deploy

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

## Infrastructure as Code - Terraform is the Master

**IMPORTANT**: As of this update, Terraform is the **master source of truth** for infrastructure configuration.

### Why Terraform is Master

1. **Version Control**: All infrastructure changes are tracked in git
2. **Declarative**: Infrastructure defined as code, not imperative scripts
3. **State Management**: Terraform tracks the actual state of resources
4. **Reproducibility**: Identical infrastructure across environments
5. **Team Collaboration**: Multiple team members can safely manage infrastructure
6. **Drift Detection**: Automatically detect manual changes made outside Terraform

### Migration Path

If you're currently using manual scripts ([scripts/setup-gcp.sh](scripts/setup-gcp.sh), [scripts/deploy-gcp.sh](scripts/deploy-gcp.sh)):

1. **Review** the [Migration Guide](terraform/MIGRATION_GUIDE.md)
2. **Import** your existing resources into Terraform state
3. **Verify** with `terraform plan` (should show no changes)
4. **Transition** to Terraform for all infrastructure changes
5. **Deprecate** manual scripts (keep for application deployments only)

### What to Use When

| Task                         | Use This                          | Example                           |
| ---------------------------- | --------------------------------- | --------------------------------- |
| Create/modify infrastructure | **Terraform**                     | `terraform apply`                 |
| Deploy application code      | **Deploy script or Cloud Build**  | `./scripts/deploy-gcp.sh`         |
| Update secrets               | **gcloud CLI**                    | `gcloud secrets versions add`     |
| View infrastructure          | **Terraform**                     | `terraform show`                  |
| Multi-environment setup      | **Terraform workspaces**          | `terraform workspace new prod`    |

### Legacy Scripts Status

The following scripts are **legacy** and maintained only for backward compatibility:

- [scripts/setup-gcp.sh](scripts/setup-gcp.sh) - Use `terraform apply` instead
- Manual secret creation - Use Terraform + gcloud for updates

The following scripts remain **actively used**:

- [scripts/deploy-gcp.sh](scripts/deploy-gcp.sh) - For application deployments (not infrastructure)
- [cloudbuild.yaml](cloudbuild.yaml) - CI/CD pipeline definition

## Support

- Terraform documentation: [terraform/README.md](terraform/README.md)
- Quick start guide: [terraform/QUICKSTART.md](terraform/QUICKSTART.md)
- Migration help: [terraform/MIGRATION_GUIDE.md](terraform/MIGRATION_GUIDE.md)
