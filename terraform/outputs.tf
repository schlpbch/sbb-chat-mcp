# Terraform Outputs for SBB Chat MCP

output "project_id" {
  description = "GCP Project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP Region"
  value       = var.region
}

output "environment" {
  description = "Environment name"
  value       = var.environment
}

# Cloud Run Outputs
output "service_name" {
  description = "Name of the Cloud Run service"
  value       = google_cloud_run_service.app.name
}

output "service_url" {
  description = "URL of the deployed Cloud Run service"
  value       = google_cloud_run_service.app.status[0].url
}

output "service_location" {
  description = "Location of the Cloud Run service"
  value       = google_cloud_run_service.app.location
}

# Artifact Registry Outputs
output "artifact_registry_repository" {
  description = "Name of the Artifact Registry repository"
  value       = google_artifact_registry_repository.repo.repository_id
}

output "artifact_registry_url" {
  description = "Full URL for pushing images to Artifact Registry"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}"
}

output "docker_image_url" {
  description = "Full Docker image URL for the application"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}/${var.app_name}:latest"
}

# Service Account Outputs
output "service_account_email" {
  description = "Email address of the Cloud Run service account"
  value       = google_service_account.cloudrun_sa.email
}

output "service_account_name" {
  description = "Name of the Cloud Run service account"
  value       = google_service_account.cloudrun_sa.account_id
}

# Secret Manager Outputs
output "gemini_api_key_secret_name" {
  description = "Name of the Gemini API key secret in Secret Manager"
  value       = google_secret_manager_secret.gemini_api_key.secret_id
}

output "mcp_server_url_secret_name" {
  description = "Name of the MCP server URL secret in Secret Manager"
  value       = google_secret_manager_secret.mcp_server_url.secret_id
}

# Deployment Commands
output "deploy_command" {
  description = "Command to deploy the application using Cloud Build"
  value       = "gcloud builds submit --config cloudbuild.yaml --region=${var.region} --substitutions=_REGION=${var.region},_SERVICE=${google_cloud_run_service.app.name}"
}

output "docker_build_command" {
  description = "Command to build and push Docker image manually"
  value       = "docker build -t ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}/${var.app_name}:latest . && docker push ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}/${var.app_name}:latest"
}

output "update_gemini_key_command" {
  description = "Command to update the Gemini API key secret"
  value       = "echo -n 'YOUR_API_KEY' | gcloud secrets versions add ${google_secret_manager_secret.gemini_api_key.secret_id} --data-file=-"
  sensitive   = false
}

output "update_mcp_url_command" {
  description = "Command to update the MCP server URL secret"
  value       = "echo -n 'https://your-mcp-server.run.app' | gcloud secrets versions add ${google_secret_manager_secret.mcp_server_url.secret_id} --data-file=-"
  sensitive   = false
}

# Cloud Build Trigger Output
output "cloud_build_trigger_id" {
  description = "ID of the Cloud Build trigger (if enabled)"
  value       = var.enable_cloud_build_trigger ? google_cloudbuild_trigger.app_trigger[0].id : null
}

# Health Check Output
output "health_check_url" {
  description = "Health check endpoint URL"
  value       = "${google_cloud_run_service.app.status[0].url}/api/health"
}

# Summary Output
output "deployment_summary" {
  description = "Summary of the deployed infrastructure"
  value = {
    service_url             = google_cloud_run_service.app.status[0].url
    environment             = var.environment
    region                  = var.region
    container_image         = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}/${var.app_name}:latest"
    service_account         = google_service_account.cloudrun_sa.email
    min_instances           = var.cloud_run_min_instances
    max_instances           = var.cloud_run_max_instances
    cpu                     = var.cloud_run_cpu
    memory                  = var.cloud_run_memory
    auto_deploy_enabled     = var.enable_cloud_build_trigger
  }
}
