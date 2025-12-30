# Development Environment Configuration

project_id  = "your-project-id-dev"
environment = "dev"

# Region
region = "europe-west6"

# Secrets (update these after initial terraform apply)
gemini_api_key = ""  # Set via: gcloud secrets versions add gemini-api-key-dev --data-file=-
mcp_server_url = ""  # Set via: gcloud secrets versions add mcp-server-url-dev --data-file=-

# Cloud Run Configuration - Development Settings
cloud_run_cpu           = "1"
cloud_run_memory        = "512Mi"
cloud_run_timeout       = 300
cloud_run_min_instances = "0"  # Scale to zero for cost savings
cloud_run_max_instances = "3"  # Lower max for dev
allow_public_access     = true

# Application Configuration
gemini_model = "gemini-2.0-flash-exp"

# Cloud Build Trigger - Disabled for dev (use manual deployments)
enable_cloud_build_trigger = false
github_owner               = ""
github_repo                = "sbb-chat-mcp"
git_branch                 = "dev"

# Labels
labels = {
  environment = "dev"
  managed_by  = "terraform"
  purpose     = "development"
}
