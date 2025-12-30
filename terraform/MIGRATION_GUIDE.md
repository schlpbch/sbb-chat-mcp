# Migration Guide: Manual Setup to Terraform

This guide helps you migrate your existing manually-created GCP infrastructure to Terraform-managed infrastructure.

## Overview

If you've already deployed the SBB Chat MCP application manually using `scripts/setup-gcp.sh` and `scripts/deploy-gcp.sh`, this guide will help you transition to Terraform without disrupting your running service.

## Prerequisites

1. Terraform installed (>= 1.0)
2. Google Cloud SDK installed and authenticated
3. Existing GCP project with deployed resources
4. Project Owner or Editor permissions

## Migration Strategy

You have two options:

### Option A: Import Existing Resources (Recommended)
Keep your existing resources and bring them under Terraform management.

### Option B: Fresh Deployment
Create new resources with Terraform and migrate traffic (more disruptive).

---

## Option A: Import Existing Resources

### Step 1: Inventory Your Resources

List all existing resources in your project:

```bash
# Set your project
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# List Cloud Run services
gcloud run services list --region=europe-west6

# List Artifact Registry repositories
gcloud artifacts repositories list --location=europe-west6

# List secrets
gcloud secrets list

# List service accounts
gcloud iam service-accounts list
```

Document the names and configurations of:
- Cloud Run service name
- Artifact Registry repository name
- Secret names (gemini-api-key, mcp-server-url)
- Service account email

### Step 2: Initialize Terraform

```bash
cd terraform
terraform init
```

### Step 3: Create Your Variables File

Copy and customize the example:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your **existing** resource names and configuration:

```hcl
project_id  = "your-actual-project-id"
environment = "staging"  # or "production"

# Leave secrets empty for now (we'll import them)
gemini_api_key = ""
mcp_server_url = ""

# Match your existing Cloud Run configuration
cloud_run_cpu           = "1"
cloud_run_memory        = "512Mi"
cloud_run_min_instances = "0"
cloud_run_max_instances = "10"
```

### Step 4: Update Terraform Configuration

If your resource names don't match the Terraform defaults, you have two options:

**Option 1: Modify variables.tf defaults** to match your existing names.

**Option 2: Use custom variable values** in your `terraform.tfvars`.

### Step 5: Import Resources

Import each existing resource into Terraform state:

#### a. Import APIs (these are auto-enabled, skip if already enabled)

```bash
# Skip this step - Terraform will detect existing APIs
```

#### b. Import Artifact Registry Repository

```bash
# Format: projects/{project}/locations/{location}/repositories/{repository}
terraform import google_artifact_registry_repository.repo \
  projects/$PROJECT_ID/locations/europe-west6/repositories/sbb-chat-mcp
```

#### c. Import Secrets

```bash
# Import Gemini API key secret
terraform import google_secret_manager_secret.gemini_api_key \
  projects/$PROJECT_ID/secrets/gemini-api-key

# Import Gemini API key version (latest)
terraform import google_secret_manager_secret_version.gemini_api_key_version \
  projects/$PROJECT_ID/secrets/gemini-api-key/versions/latest

# Import MCP URL secret
terraform import google_secret_manager_secret.mcp_server_url \
  projects/$PROJECT_ID/secrets/mcp-server-url

# Import MCP URL version (latest)
terraform import google_secret_manager_secret_version.mcp_server_url_version \
  projects/$PROJECT_ID/secrets/mcp-server-url/versions/latest
```

#### d. Import Service Account

```bash
# Find your service account
SA_EMAIL=$(gcloud iam service-accounts list --filter="displayName:sbb-chat-mcp" --format="value(email)")

# Import service account
terraform import google_service_account.cloudrun_sa \
  projects/$PROJECT_ID/serviceAccounts/$SA_EMAIL
```

#### e. Import Cloud Run Service

```bash
# Format: locations/{location}/namespaces/{project}/services/{service}
terraform import google_cloud_run_service.app \
  projects/$PROJECT_ID/locations/europe-west6/services/sbb-chat-mcp
```

#### f. Import IAM Bindings (if applicable)

```bash
# Import public access IAM binding
terraform import 'google_cloud_run_service_iam_member.public_access[0]' \
  "projects/$PROJECT_ID/locations/europe-west6/services/sbb-chat-mcp roles/run.invoker allUsers"
```

### Step 6: Verify Import

Run a plan to ensure Terraform recognizes your resources:

```bash
terraform plan
```

**Expected output**: "No changes" or minimal cosmetic changes (labels, annotations).

**Warning signs**:
- Terraform wants to destroy and recreate resources
- Major configuration differences detected

If you see destructive changes, review your `terraform.tfvars` to ensure it matches your existing configuration.

### Step 7: Handle Secret Data

Terraform cannot import secret **values**, only the secret metadata. Your existing secret values are preserved.

To verify secrets are accessible:

```bash
gcloud secrets versions access latest --secret=gemini-api-key
gcloud secrets versions access latest --secret=mcp-server-url
```

### Step 8: Apply Terraform (Dry Run)

```bash
# Plan with detailed output
terraform plan -out=tfplan

# Review the plan carefully
terraform show tfplan
```

Only proceed if the plan shows no destructive changes.

### Step 9: Apply Changes

```bash
terraform apply tfplan
```

### Step 10: Verify Deployment

```bash
# Get the service URL
terraform output service_url

# Test the health endpoint
curl $(terraform output -raw service_url)/api/health

# Check Cloud Run status
gcloud run services describe sbb-chat-mcp --region=europe-west6
```

### Step 11: Update Deployment Workflow

From now on, use Terraform for infrastructure changes:

```bash
# Make changes to .tf files or .tfvars
terraform plan
terraform apply
```

For application deployments, continue using:

```bash
./scripts/deploy-gcp.sh
```

---

## Option B: Fresh Deployment

If you prefer a clean slate or encounter issues with importing:

### Step 1: Deploy to a New Environment

```bash
cd terraform

# Create a new workspace
terraform workspace new staging-new

# Apply with a different service name
terraform apply -var="app_name=sbb-chat-mcp-new"
```

### Step 2: Test the New Deployment

```bash
NEW_URL=$(terraform output -raw service_url)
curl $NEW_URL/api/health
```

### Step 3: Migrate Traffic

Use Cloud Run traffic splitting or update DNS:

```bash
# Option 1: Update DNS to point to new service
# Option 2: Use Cloud Run traffic migration

gcloud run services update-traffic sbb-chat-mcp-new \
  --region=europe-west6 \
  --to-latest
```

### Step 4: Destroy Old Resources

Once the new deployment is stable:

```bash
# Manually delete old resources
gcloud run services delete sbb-chat-mcp --region=europe-west6
gcloud artifacts repositories delete sbb-chat-mcp --location=europe-west6
```

---

## Troubleshooting

### Error: Resource Already Exists

If you get "already exists" errors:
1. Use `terraform import` to import the resource
2. Or rename your Terraform resources to avoid conflicts

### Error: Permission Denied

Ensure your account has the required permissions:

```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:your-email@example.com" \
  --role="roles/editor"
```

### Error: API Not Enabled

Enable required APIs:

```bash
gcloud services enable cloudrun.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### State File Corruption

If your state file becomes corrupted:

1. **Backup state**:
   ```bash
   cp terraform.tfstate terraform.tfstate.backup
   ```

2. **Remove problematic resource from state**:
   ```bash
   terraform state rm google_cloud_run_service.app
   ```

3. **Re-import**:
   ```bash
   terraform import google_cloud_run_service.app \
     projects/$PROJECT_ID/locations/europe-west6/services/sbb-chat-mcp
   ```

### Drift Detection

To detect manual changes made outside Terraform:

```bash
terraform plan -refresh-only
```

---

## Post-Migration Checklist

- [ ] All resources imported successfully
- [ ] `terraform plan` shows no changes
- [ ] Application is accessible and functional
- [ ] Secrets are accessible and correct
- [ ] Health endpoint returns `200 OK`
- [ ] CI/CD pipeline updated (if applicable)
- [ ] Team members have Terraform access
- [ ] State file is backed up (or in remote storage)
- [ ] Documentation updated with new workflow
- [ ] Old deployment scripts deprecated

---

## Best Practices After Migration

1. **Use Remote State**: Configure GCS backend for team collaboration
   ```bash
   # See README.md for remote state setup
   ```

2. **Enable State Locking**: Prevents concurrent modifications

3. **Regular Plan Checks**: Run `terraform plan` regularly to detect drift

4. **Version Control**: Commit all `.tf` files to git

5. **Never Commit Secrets**: Keep `terraform.tfvars` in `.gitignore`

6. **Document Changes**: Update this guide with your specific setup

---

## Rollback Plan

If migration fails, you can rollback:

1. **Stop using Terraform**:
   ```bash
   cd terraform
   terraform destroy -target=google_cloud_run_service_iam_member.public_access
   # Don't destroy the actual service
   ```

2. **Continue with manual deployments**:
   ```bash
   ./scripts/deploy-gcp.sh
   ```

3. **Debug and retry migration later**

---

## Support

For migration assistance:
- Review Terraform logs: `terraform plan -debug`
- Check GCP audit logs: Cloud Console → Logging
- Consult [Terraform Google Provider docs](https://registry.terraform.io/providers/hashicorp/google/latest/docs)

---

## Next Steps

After successful migration:
1. Set up remote state (see [README.md](README.md))
2. Configure CI/CD with Terraform (GitHub Actions, Cloud Build)
3. Implement environment promotion workflow (dev → staging → prod)
4. Add monitoring and alerting resources to Terraform
