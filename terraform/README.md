# Terraform Infrastructure Configuration

This directory contains the Infrastructure as Code (IaC) configuration for the Swiss Travel Companion application deployed on Google Cloud Platform.

## Overview

The Terraform configuration manages:

- Cloud Run service for the Next.js application
- Artifact Registry repository for Docker images
- Secret Manager secrets for API keys and configuration
- IAM permissions and service accounts
- Cloud Build triggers for CI/CD
- Required GCP APIs

## Prerequisites

1. **Terraform**: Install Terraform >= 1.0

   ```bash
   # macOS
   brew install terraform

   # Windows
   choco install terraform

   # Linux
   wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
   unzip terraform_1.6.0_linux_amd64.zip
   sudo mv terraform /usr/local/bin/
   ```

2. **Google Cloud SDK**: Install and authenticate

   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

3. **Required Permissions**: Your GCP user must have:
   - Project Owner or Editor role
   - Cloud Run Admin
   - Secret Manager Admin
   - Artifact Registry Admin
   - Service Usage Admin

## Directory Structure

```
terraform/
├── README.md                 # This file
├── main.tf                   # Main Terraform configuration
├── variables.tf              # Variable definitions
├── outputs.tf                # Output definitions
├── terraform.tfvars.example  # Example variables file
├── environments/
│   ├── dev.tfvars           # Development environment
│   ├── staging.tfvars       # Staging environment
│   └── production.tfvars    # Production environment
└── modules/                  # Reusable Terraform modules (future)
```

## Quick Start

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Create Your Variables File

Copy the example and fill in your values:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your specific values:

- `project_id`: Your GCP project ID
- `gemini_api_key`: Your Google Gemini API key
- `mcp_server_url`: Your MCP server endpoint

### 3. Plan the Infrastructure

Review what Terraform will create:

```bash
# For default (staging) environment
terraform plan

# For a specific environment
terraform plan -var-file="environments/production.tfvars"
```

### 4. Apply the Configuration

Create the infrastructure:

```bash
# For default environment
terraform apply

# For a specific environment
terraform apply -var-file="environments/production.tfvars"
```

Type `yes` when prompted to confirm.

### 5. View Outputs

After successful application, view the outputs:

```bash
terraform output
```

## Environment Management

### Development Environment

```bash
terraform workspace new dev
terraform apply -var-file="environments/dev.tfvars"
```

### Staging Environment

```bash
terraform workspace new staging
terraform apply -var-file="environments/staging.tfvars"
```

### Production Environment

```bash
terraform workspace new production
terraform apply -var-file="environments/production.tfvars"
```

## Managing Secrets

Secrets are managed through Terraform but values are not stored in the configuration files.

### Initial Setup

1. Secrets are created with placeholder values by Terraform
2. Update them manually using the `gcloud` CLI:

```bash
# Update Gemini API key
echo -n "your-actual-api-key" | gcloud secrets versions add gemini-api-key --data-file=-

# Update MCP server URL
echo -n "https://your-mcp-server.run.app" | gcloud secrets versions add mcp-server-url --data-file=-
```

### Using Existing Secrets

If you already have secrets created, you can import them:

```bash
terraform import google_secret_manager_secret.gemini_api_key projects/YOUR_PROJECT_ID/secrets/gemini-api-key
terraform import google_secret_manager_secret_version.gemini_api_key_version projects/YOUR_PROJECT_ID/secrets/gemini-api-key/versions/latest
```

## Common Operations

### View Current State

```bash
terraform show
```

### List Resources

```bash
terraform state list
```

### Update a Specific Resource

```bash
terraform apply -target=google_cloud_run_service.app
```

### Destroy Infrastructure

**WARNING**: This will delete all resources managed by Terraform!

```bash
terraform destroy
```

For a specific environment:

```bash
terraform destroy -var-file="environments/dev.tfvars"
```

## CI/CD Integration

### Manual Deployment

After infrastructure is created, deploy the application:

```bash
# From project root
./scripts/deploy-gcp.sh
```

### Automated Deployment

The Terraform configuration creates a Cloud Build trigger that automatically deploys on git push to the main branch.

To disable automatic triggers, set in your `.tfvars`:

```hcl
enable_cloud_build_trigger = false
```

## State Management

### Local State (Default)

By default, Terraform state is stored locally in `terraform.tfstate`. This is suitable for individual development but not recommended for teams.

### Remote State (Recommended for Teams)

Configure GCS backend for shared state:

1. Create a GCS bucket for state:

   ```bash
   gsutil mb -p YOUR_PROJECT_ID -l europe-west6 gs://YOUR_PROJECT_ID-terraform-state
   gsutil versioning set on gs://YOUR_PROJECT_ID-terraform-state
   ```

2. Create `backend.tf`:

   ```hcl
   terraform {
     backend "gcs" {
       bucket = "YOUR_PROJECT_ID-terraform-state"
       prefix = "terraform/state"
     }
   }
   ```

3. Re-initialize:

   ```bash
   terraform init -migrate-state
   ```

## Resource Naming Convention

Resources follow this pattern:

- Development: `sbb-chat-mcp-dev-*`
- Staging: `sbb-chat-mcp-staging-*`
- Production: `sbb-chat-mcp-*`

## Cost Estimation

Use the `terraform plan` output to estimate costs, or integrate with:

```bash
# Using Infracost
infracost breakdown --path .
```

Expected monthly costs (staging):

- Cloud Run: ~$5-20 (with scale-to-zero)
- Artifact Registry: ~$0.10/GB
- Secret Manager: ~$0.06/secret/month
- Cloud Build: ~$0.003/min (first 120 min/day free)

**Total estimated**: $10-30/month (varies with traffic)

## Troubleshooting

### Authentication Issues

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

### API Not Enabled

If you get "API not enabled" errors:

```bash
gcloud services enable cloudrun.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### Permission Denied

Ensure your user has the required roles:

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="user:your-email@example.com" \
  --role="roles/editor"
```

### State Lock Issues

If state is locked:

```bash
terraform force-unlock LOCK_ID
```

## Best Practices

1. **Always run `terraform plan`** before `terraform apply`
2. **Use workspaces or separate state files** for different environments
3. **Never commit `terraform.tfvars`** with sensitive data (it's in .gitignore)
4. **Use remote state** for team collaboration
5. **Tag all resources** for cost tracking and organization
6. **Enable state locking** when using remote state
7. **Review the plan output** carefully before applying changes
8. **Use variables** for all environment-specific values
9. **Document any manual changes** outside of Terraform

## Migration from Manual Setup

If you already have resources created manually:

1. **Audit existing resources**:

   ```bash
   gcloud run services list
   gcloud artifacts repositories list
   gcloud secrets list
   ```

2. **Import existing resources**:

   ```bash
   terraform import google_cloud_run_service.app projects/YOUR_PROJECT_ID/locations/europe-west6/services/sbb-chat-mcp
   terraform import google_artifact_registry_repository.repo projects/YOUR_PROJECT_ID/locations/europe-west6/repositories/sbb-chat-mcp
   ```

3. **Verify with plan**:

   ```bash
   terraform plan
   ```

   Should show "No changes" if imports were successful.

## Support

For issues or questions:

- Check the [GCP Terraform Provider documentation](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- Review Cloud Run [best practices](https://cloud.google.com/run/docs/best-practices)
- Open an issue in the project repository

## References

- [Terraform Documentation](https://www.terraform.io/docs)
- [Google Cloud Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)
