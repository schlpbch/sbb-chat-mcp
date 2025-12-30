# Terraform Quick Start Guide

Get your Swiss Travel Companion infrastructure up and running in 10 minutes.

## Prerequisites

- Google Cloud account with billing enabled
- Terraform installed (>= 1.0)
- gcloud CLI installed and authenticated

## Quick Setup

### 1. Authenticate with GCP

```bash
gcloud auth login
gcloud auth application-default login
```

### 2. Create or Select a GCP Project

```bash
# Create a new project (optional)
gcloud projects create sbb-chat-mcp-project --name="Swiss Travel Companion"

# Set the project
export PROJECT_ID="sbb-chat-mcp-project"
gcloud config set project $PROJECT_ID

# Enable billing (required for Cloud Run)
# Visit: https://console.cloud.google.com/billing
```

### 3. Initialize Terraform

```bash
cd terraform
terraform init
```

### 4. Configure Variables

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with minimal required values:

```hcl
project_id = "sbb-chat-mcp-project"  # Your project ID

# These will be placeholders initially
gemini_api_key = ""
mcp_server_url = ""
```

### 5. Apply Terraform

```bash
# Review the plan
terraform plan

# Apply the configuration
terraform apply
```

Type `yes` when prompted.

**This creates**:

- Cloud Run service
- Artifact Registry repository
- Secret Manager secrets (with placeholders)
- Service account with proper IAM permissions
- Enabled required GCP APIs

### 6. Update Secrets

After Terraform completes, update the secrets with real values:

```bash
# Get your Gemini API key from: https://aistudio.google.com/apikey
echo -n "your-actual-gemini-api-key" | gcloud secrets versions add gemini-api-key-staging --data-file=-

# Set your MCP server URL (or use a staging server)
echo -n "https://journey-service-mcp-staging-xxx.run.app" | gcloud secrets versions add mcp-server-url-staging --data-file=-
```

### 7. Build and Deploy Your Application

```bash
# Return to project root
cd ..

# Deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml --region=europe-west6
```

Or use the deployment script:

```bash
./scripts/deploy-gcp.sh
```

### 8. Get Your Service URL

```bash
cd terraform
terraform output service_url
```

### 9. Test Your Deployment

```bash
# Get the URL
SERVICE_URL=$(terraform output -raw service_url)

# Test health endpoint
curl $SERVICE_URL/api/health

# Open in browser
open $SERVICE_URL  # macOS
# or
start $SERVICE_URL  # Windows
```

## That's It! 🎉

Your Swiss Travel Companion application is now running on Cloud Run with:

- Auto-scaling (0-10 instances)
- HTTPS enabled
- Secrets managed securely
- Container images in Artifact Registry

## Next Steps

### View All Outputs

```bash
terraform output
```

### Make Configuration Changes

1. Edit `terraform.tfvars`
2. Run `terraform plan` to preview changes
3. Run `terraform apply` to apply changes

### Deploy Application Updates

```bash
# From project root
./scripts/deploy-gcp.sh
```

### Set Up Multiple Environments

```bash
# Development
terraform workspace new dev
terraform apply -var-file="environments/dev.tfvars"

# Production
terraform workspace new production
terraform apply -var-file="environments/production.tfvars"
```

### Enable Auto-Deployment

Edit `terraform.tfvars`:

```hcl
enable_cloud_build_trigger = true
github_owner = "your-github-username"
github_repo = "sbb-chat-mcp"
git_branch = "main"
```

Apply the change:

```bash
terraform apply
```

Now every push to `main` will auto-deploy!

## Common Commands

```bash
# View current infrastructure
terraform show

# List all resources
terraform state list

# View outputs
terraform output

# Refresh state
terraform refresh

# Destroy everything (careful!)
terraform destroy
```

## Troubleshooting

### "API not enabled" error

```bash
gcloud services enable cloudrun.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### "Permission denied" error

```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:$(gcloud config get-value account)" \
  --role="roles/editor"
```

### Application not accessible

Check Cloud Run logs:

```bash
gcloud run services logs read sbb-chat-mcp-staging --region=europe-west6 --limit=50
```

### Secrets not working

Verify secret values:

```bash
gcloud secrets versions access latest --secret=gemini-api-key-staging
gcloud secrets versions access latest --secret=mcp-server-url-staging
```

## Cost Estimation

With default settings (staging environment):

- **Cloud Run**: $5-20/month (scales to zero when idle)
- **Artifact Registry**: ~$0.10/GB storage
- **Secret Manager**: ~$0.06/secret/month
- **Cloud Build**: First 120 minutes/day free

**Estimated total**: $10-30/month for a staging environment with moderate traffic.

## Support

- Full documentation: [README.md](README.md)
- Migration guide: [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- Terraform docs: <https://www.terraform.io/docs>
- GCP Provider docs: <https://registry.terraform.io/providers/hashicorp/google/latest/docs>
