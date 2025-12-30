# Staging Environment Configuration

project_id  = "your-project-id"  # Update with your actual GCP project ID
environment = "staging"

# Region - Zurich, Switzerland
region = "europe-west6"

# Secrets (update these after initial terraform apply)
# Use: echo -n "your-key" | gcloud secrets versions add gemini-api-key-staging --data-file=-
gemini_api_key = ""
mcp_server_url = ""  # e.g., https://journey-service-mcp-staging-xxx.run.app

# Cloud Run Configuration - Staging Settings
cloud_run_cpu           = "1"
cloud_run_memory        = "512Mi"
cloud_run_timeout       = 300
cloud_run_min_instances = "0"   # Scale to zero for cost efficiency
cloud_run_max_instances = "10"  # Allow bursting for testing
allow_public_access     = true

# Application Configuration
gemini_model = "gemini-2.0-flash-exp"

# Cloud Build Trigger - Optional for staging
enable_cloud_build_trigger = false  # Set to true to enable auto-deploy on push
github_owner               = ""     # Your GitHub username/org
github_repo                = "sbb-chat-mcp"
git_branch                 = "main"

# Labels
labels = {
  environment = "staging"
  managed_by  = "terraform"
  purpose     = "pre-production-testing"
}
