# Production Environment Configuration

project_id  = "your-project-id-prod"
environment = "production"

# Region - Zurich, Switzerland
region = "europe-west6"

# Secrets (update these after initial terraform apply)
# IMPORTANT: Use strong, production-grade API keys
# Use: echo -n "your-production-key" | gcloud secrets versions add gemini-api-key-production --data-file=-
gemini_api_key = ""
mcp_server_url = ""  # Production MCP server URL

# Cloud Run Configuration - Production Settings
cloud_run_cpu           = "2"       # More CPU for production
cloud_run_memory        = "1Gi"     # More memory for production
cloud_run_timeout       = 300
cloud_run_min_instances = "1"       # Always keep 1 instance warm for better performance
cloud_run_max_instances = "20"      # Higher max for production traffic
allow_public_access     = true

# Application Configuration
gemini_model = "gemini-2.0-flash-exp"  # Consider using gemini-1.5-pro for production

# Cloud Build Trigger - Recommended for production
enable_cloud_build_trigger = true  # Auto-deploy on push to main
github_owner               = ""    # Your GitHub username/org
github_repo                = "sbb-chat-mcp"
git_branch                 = "main"

# Labels
labels = {
  environment     = "production"
  managed_by      = "terraform"
  criticality     = "high"
  business_unit   = "travel-services"
  compliance      = "gdpr"
}
