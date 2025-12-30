# Infrastructure Documentation

**Last Updated:** 2025-12-30

This document provides a comprehensive overview of the SBB Chat MCP cloud infrastructure.

## Executive Summary

The SBB Chat MCP application is deployed on **Google Cloud Platform** using a modern serverless architecture. The infrastructure is fully managed through **Terraform** (Infrastructure as Code), ensuring reproducibility, version control, and team collaboration.

### Key Metrics

- **Platform:** Google Cloud Platform (GCP)
- **Primary Service:** Cloud Run (serverless containers)
- **Region:** europe-west6 (Zurich, Switzerland)
- **Infrastructure Management:** Terraform 1.0+
- **Deployment Method:** Cloud Build + Docker
- **Auto-Scaling:** 0-10 instances (scales to zero)
- **Estimated Cost:** $10-30/month (staging), $50-100/month (production)

---

## Infrastructure Components

### 1. Cloud Run Service

**Purpose:** Hosts the Next.js application as a containerized service.

**Configuration:**

- **Service Name:** `sbb-chat-mcp-{environment}`
- **Region:** `europe-west6` (Zurich, Switzerland)
- **Container Port:** 8080
- **Resources:**
  - CPU: 1 vCPU (staging), 2 vCPU (production)
  - Memory: 512Mi (staging), 1Gi (production)
  - Timeout: 300 seconds
- **Auto-Scaling:**
  - Min Instances: 0 (staging), 1 (production)
  - Max Instances: 10 (staging), 20 (production)
- **Access:** Public (unauthenticated)
- **TLS:** Automatic HTTPS via Google-managed certificates

**Managed by:** `terraform/main.tf` → `google_cloud_run_service.app`

### 2. Artifact Registry

**Purpose:** Stores Docker container images for the application.

**Configuration:**

- **Repository Name:** `sbb-chat-mcp-{environment}`
- **Format:** Docker
- **Location:** `europe-west6`
- **Image URL:** `europe-west6-docker.pkg.dev/{project-id}/{repo-id}/sbb-chat-mcp:latest`

**Managed by:** `terraform/main.tf` → `google_artifact_registry_repository.repo`

### 3. Secret Manager

**Purpose:** Securely stores API keys and configuration secrets.

**Secrets:**

1. **`gemini-api-key-{environment}`**
   - Contains: Google Gemini API key
   - Used for: LLM chat functionality + Cloud Translation API
   - Access: Cloud Run service account

2. **`mcp-server-url-{environment}`**
   - Contains: Journey Service MCP endpoint URL
   - Used for: MCP tool integration
   - Access: Cloud Run service account

**Managed by:** `terraform/main.tf` → `google_secret_manager_secret.*`

### 4. Service Accounts

**Purpose:** Identity for the Cloud Run service to access GCP resources.

**Service Account:** `sbb-chat-mcp-{environment}-sa@{project}.iam.gserviceaccount.com`

**IAM Roles:**

- `roles/secretmanager.secretAccessor` - Access secrets

**Managed by:** `terraform/main.tf` → `google_service_account.cloudrun_sa`

### 5. Cloud Build

**Purpose:** CI/CD pipeline for building and deploying the application.

**Configuration:**

- **Build Machine:** E2_HIGHCPU_8
- **Steps:**
  1. Test & Lint (pnpm install, lint, test)
  2. Docker Build (multi-stage Dockerfile)
  3. Push to Artifact Registry
  4. Deploy to Cloud Run
  5. Health Check Verification

**Build Trigger (Optional):**

- Triggers on push to `main` branch (if enabled)
- GitHub integration via Cloud Build app
- Configurable per environment

**Managed by:**
- Pipeline: `cloudbuild.yaml`
- Trigger: `terraform/main.tf` → `google_cloudbuild_trigger.app_trigger`

### 6. Enabled APIs

**Required GCP APIs:**

- `run.googleapis.com` - Cloud Run
- `cloudbuild.googleapis.com` - Cloud Build
- `artifactregistry.googleapis.com` - Artifact Registry
- `secretmanager.googleapis.com` - Secret Manager
- `cloudresourcemanager.googleapis.com` - Resource Manager
- `translate.googleapis.com` - Cloud Translation API

**Managed by:** `terraform/main.tf` → `google_project_service.required_apis`

---

## Infrastructure as Code (Terraform)

### Terraform Files

| File | Purpose |
| ---- | ------- |
| [terraform/main.tf](terraform/main.tf) | Main infrastructure configuration |
| [terraform/variables.tf](terraform/variables.tf) | Variable definitions |
| [terraform/outputs.tf](terraform/outputs.tf) | Output definitions |
| [terraform/environments/dev.tfvars](terraform/environments/dev.tfvars) | Development environment config |
| [terraform/environments/staging.tfvars](terraform/environments/staging.tfvars) | Staging environment config |
| [terraform/environments/production.tfvars](terraform/environments/production.tfvars) | Production environment config |

### State Management

**Current:** Local state file (`terraform.tfstate`)

**Recommended (for teams):** Remote state in GCS bucket

```hcl
terraform {
  backend "gcs" {
    bucket = "your-project-terraform-state"
    prefix = "terraform/state"
  }
}
```

See [terraform/README.md](terraform/README.md) for remote state setup instructions.

---

## Deployment Architecture

### Build & Deployment Flow

```
Developer Push → GitHub → Cloud Build Trigger (Optional)
                             ↓
                    Cloud Build Pipeline
                             ↓
            ┌────────────────┼────────────────┐
            ↓                ↓                ↓
         Test/Lint     Docker Build      Push Image
            ↓                                 ↓
         Success?                    Artifact Registry
            ↓                                 ↓
    ┌──────┴──────┐                    Cloud Run Deploy
    ↓             ↓                           ↓
  Pass          Fail                   Health Check
    ↓             ↓                           ↓
  Deploy      Abort                      Success/Fail
```

### Container Build Process

**Multi-stage Dockerfile:**

1. **Stage 1 (deps):** Install dependencies with pnpm
2. **Stage 2 (builder):** Build Next.js app with standalone output
3. **Stage 3 (runner):** Production runtime
   - Base: Node.js 20 Alpine
   - User: `nextjs` (UID 1001, non-root)
   - Working Dir: `/app`
   - Exposed Port: 8080

**Image Size:** ~150-200 MB (optimized)

---

## Environment Configurations

### Development Environment

- **Purpose:** Local testing and experimentation
- **Resources:** Minimal (512Mi RAM, 1 CPU)
- **Scaling:** 0-3 instances
- **Cost:** ~$5-10/month
- **Auto-Deploy:** Disabled

### Staging Environment

- **Purpose:** Pre-production testing and validation
- **Resources:** Standard (512Mi RAM, 1 CPU)
- **Scaling:** 0-10 instances
- **Cost:** ~$10-30/month
- **Auto-Deploy:** Optional

### Production Environment

- **Purpose:** Live user-facing application
- **Resources:** Enhanced (1Gi RAM, 2 CPU)
- **Scaling:** 1-20 instances (always warm)
- **Cost:** ~$50-100/month
- **Auto-Deploy:** Recommended (with safeguards)

---

## Security Measures

### Application Security

1. **Non-root Container:** Application runs as user `nextjs` (UID 1001)
2. **Secret Management:** No secrets in code or environment files
3. **TLS/HTTPS:** Automatic via Cloud Run
4. **Input Validation:** All API inputs validated
5. **CORS Handling:** Proper CORS configuration for MCP proxy

### Infrastructure Security

1. **IAM:** Principle of least privilege
2. **Service Accounts:** Dedicated service account per environment
3. **Secret Access:** Secrets mounted as environment variables (not volumes)
4. **Network:** Cloud Run provides automatic DDoS protection
5. **Audit Logging:** All infrastructure changes logged in Cloud Audit Logs

### Secret Rotation

**Manual Process:**

```bash
# Update secret value
echo -n "new-secret-value" | gcloud secrets versions add gemini-api-key-staging --data-file=-

# Deploy new Cloud Run revision (picks up new secret)
gcloud run deploy sbb-chat-mcp-staging --region=europe-west6
```

**Best Practice:** Rotate secrets every 90 days

---

## Monitoring & Observability

### Health Checks

**Endpoint:** `/api/health`

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-12-30T12:00:00.000Z",
  "version": "1.0.0"
}
```

**Used by:**

- Cloud Run health checks
- Cloud Build deployment verification
- External monitoring tools

### Logging

**Location:** Cloud Logging (formerly Stackdriver)

**Log Types:**

- Application logs (console.log, logger.ts)
- Cloud Run request logs
- Cloud Build logs
- Audit logs

**Retention:** 30 days (default)

**Access:**

```bash
# View Cloud Run logs
gcloud run services logs read sbb-chat-mcp-staging --region=europe-west6 --limit=100

# Follow logs in real-time
gcloud run services logs tail sbb-chat-mcp-staging --region=europe-west6
```

### Metrics

**Cloud Run Metrics (automatic):**

- Request count
- Request latency (p50, p95, p99)
- Container CPU utilization
- Container memory utilization
- Instance count
- Billable instance time

**Access:** Cloud Console → Cloud Run → Metrics tab

### Alerting (Recommended Setup)

Create alerts for:

- Error rate > 5%
- p95 latency > 2 seconds
- Instance count at max (scaling limit reached)
- Cost budget exceeded

---

## Cost Optimization

### Current Optimizations

1. **Scale to Zero:** Staging environment scales to 0 when idle
2. **Right-Sized Resources:** CPU/memory matched to actual usage
3. **Multi-stage Build:** Minimal Docker image size
4. **Standalone Next.js:** Reduced dependencies and runtime overhead
5. **Regional Deployment:** Single region (europe-west6)

### Cost Breakdown (Estimated Monthly)

**Staging Environment:**

- Cloud Run: $5-20 (depends on traffic)
- Artifact Registry: $0.10/GB (~$0.50)
- Secret Manager: $0.06/secret ($0.12)
- Cloud Build: Free (first 120 min/day)

**Total:** $10-30/month

**Production Environment:**

- Cloud Run: $30-80 (higher traffic, always warm)
- Artifact Registry: $0.10/GB (~$0.50)
- Secret Manager: $0.06/secret ($0.12)
- Cloud Build: $0.003/min (after free tier)

**Total:** $50-100/month

### Cost Monitoring

```bash
# Export billing data to BigQuery (recommended)
gcloud alpha billing accounts get-iam-policy BILLING_ACCOUNT_ID

# Use Cloud Billing reports in Console
https://console.cloud.google.com/billing
```

---

## Disaster Recovery

### Backup Strategy

**State Files:**

- Terraform state backed up before each apply
- Store state in GCS with versioning enabled
- Separate state files per environment

**Secrets:**

- Document secret values in secure vault (e.g., 1Password, HashiCorp Vault)
- Enable secret versioning in Secret Manager
- Export secret metadata (not values) to version control

**Container Images:**

- All images tagged with git commit SHA
- Artifact Registry retains all image versions
- Implement image retention policy (e.g., keep last 10 versions)

### Recovery Procedures

**Scenario 1: Cloud Run service deleted**

```bash
cd terraform
terraform apply  # Recreates service from state
```

**Scenario 2: Region outage**

1. Update Terraform config with new region
2. Apply Terraform changes
3. Update DNS (if using custom domain)

**Scenario 3: Corrupted deployment**

```bash
# Rollback to previous revision
gcloud run revisions list --service=sbb-chat-mcp-staging --region=europe-west6
gcloud run services update-traffic sbb-chat-mcp-staging \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=europe-west6
```

**RTO (Recovery Time Objective):** < 15 minutes
**RPO (Recovery Point Objective):** < 5 minutes (last git commit)

---

## Maintenance Procedures

### Regular Maintenance Tasks

**Weekly:**

- Review Cloud Run logs for errors
- Check instance scaling patterns
- Monitor cost trends

**Monthly:**

- Review and rotate secrets
- Update dependencies (package.json)
- Review Terraform plan for drift
- Clean up old container images

**Quarterly:**

- Review IAM permissions
- Update Terraform provider versions
- Review and optimize resource allocation
- Conduct disaster recovery drill

### Terraform Drift Detection

```bash
cd terraform
terraform plan -refresh-only  # Detect manual changes
```

If drift detected:

1. Review changes in plan output
2. Either import changes or revert manually
3. Update Terraform to match desired state

### Updating Infrastructure

**Process:**

1. Update Terraform configuration files
2. Run `terraform plan` and review changes
3. Get approval (for production)
4. Run `terraform apply`
5. Verify changes in Cloud Console
6. Commit Terraform changes to git

---

## Troubleshooting

### Common Issues

**Issue: Deployment fails with "API not enabled"**

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

**Issue: Cloud Run service returns 5xx errors**

```bash
# Check logs
gcloud run services logs read sbb-chat-mcp-staging --region=europe-west6 --limit=50

# Check service status
gcloud run services describe sbb-chat-mcp-staging --region=europe-west6
```

**Issue: Secrets not accessible**

```bash
# Verify secret exists
gcloud secrets versions access latest --secret=gemini-api-key-staging

# Verify IAM permissions
gcloud secrets get-iam-policy gemini-api-key-staging
```

**Issue: Terraform state lock**

```bash
# Force unlock (use with caution)
terraform force-unlock LOCK_ID
```

### Support Contacts

- **Infrastructure Issues:** Check [terraform/README.md](terraform/README.md)
- **GCP Support:** https://cloud.google.com/support
- **Terraform Issues:** https://github.com/hashicorp/terraform/issues

---

## Future Enhancements

### Planned Improvements

1. **Multi-region Deployment**
   - Deploy to multiple regions for HA
   - Use Cloud Load Balancer for traffic distribution

2. **Enhanced Monitoring**
   - Set up Cloud Monitoring dashboards
   - Configure alerting policies
   - Integrate with Slack/PagerDuty

3. **CI/CD Improvements**
   - Implement blue/green deployments
   - Add canary releases
   - Automated rollback on failure

4. **Cost Optimization**
   - Implement Cloud Scheduler to stop dev/staging at night
   - Use committed use discounts for production
   - Optimize container image size further

5. **Security Enhancements**
   - Implement Cloud Armor (DDoS protection)
   - Add VPC Service Controls
   - Enable Binary Authorization

6. **Performance**
   - Add Cloud CDN for static assets
   - Implement Redis for caching
   - Use Cloud Run min instances > 0 for production

---

## Appendix

### Quick Reference

**Deploy new version:**

```bash
./scripts/deploy-gcp.sh
```

**View service URL:**

```bash
cd terraform && terraform output service_url
```

**View logs:**

```bash
gcloud run services logs tail sbb-chat-mcp-staging --region=europe-west6
```

**Update secret:**

```bash
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-
```

**Terraform commands:**

```bash
terraform init      # Initialize
terraform plan      # Preview changes
terraform apply     # Apply changes
terraform destroy   # Destroy infrastructure (careful!)
terraform output    # Show outputs
```

### Related Documentation

- [README.md](README.md) - Project overview
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [terraform/README.md](terraform/README.md) - Terraform documentation
- [terraform/QUICKSTART.md](terraform/QUICKSTART.md) - Quick start guide
- [terraform/MIGRATION_GUIDE.md](terraform/MIGRATION_GUIDE.md) - Migration guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - Application architecture

### Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Google Cloud Platform                    │
│                    Project: sbb-chat-mcp                     │
│                   Region: europe-west6                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Cloud Run Service                  │   │
│  │              sbb-chat-mcp-{environment}              │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐ │   │
│  │  │        Next.js Application Container           │ │   │
│  │  │          (Node.js 20 Alpine)                   │ │   │
│  │  │          Port: 8080                            │ │   │
│  │  │          User: nextjs (UID 1001)               │ │   │
│  │  └────────────────────────────────────────────────┘ │   │
│  │                                                       │   │
│  │  Resources: 512Mi RAM, 1 vCPU                        │   │
│  │  Auto-scaling: 0-10 instances                        │   │
│  │  HTTPS: Auto-managed                                 │   │
│  └──────────────┬────────────────────────┬──────────────┘   │
│                 │                        │                   │
│                 │                        │                   │
│  ┌──────────────▼──────────┐  ┌─────────▼────────────────┐ │
│  │   Secret Manager        │  │  Artifact Registry       │ │
│  │                         │  │                          │ │
│  │  • gemini-api-key       │  │  Docker Images:          │ │
│  │  • mcp-server-url       │  │  • sbb-chat-mcp:latest   │ │
│  │                         │  │  • sbb-chat-mcp:{sha}    │ │
│  └─────────────────────────┘  └──────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Cloud Build                        │   │
│  │                                                       │   │
│  │  Pipeline: cloudbuild.yaml                           │   │
│  │  Steps: Test → Build → Push → Deploy → Verify       │   │
│  │  Trigger: GitHub push to main (optional)             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                Service Account                       │   │
│  │    sbb-chat-mcp-{env}-sa@{project}.iam               │   │
│  │                                                       │   │
│  │  Roles: secretmanager.secretAccessor                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘

External Services:
  • Google Gemini API (LLM)
  • Cloud Translation API
  • Journey Service MCP (staging/dev)
```

---

**Document Version:** 1.0
**Last Reviewed:** 2025-12-30
**Next Review:** 2026-01-30
