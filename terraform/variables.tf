# Terraform Variables for Swiss Travel Companion

# Project Configuration
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region for resources"
  type        = string
  default     = "europe-west6"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "sbb-chat-mcp"
}

variable "artifact_registry_repo_id" {
  description = "Artifact Registry repository ID (defaults to 'sbb-chat' to match existing)"
  type        = string
  default     = "sbb-chat"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "staging"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

# Secret Configuration
variable "gemini_api_key" {
  description = "Google Gemini API key (leave empty to use placeholder)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "mcp_server_url" {
  description = "MCP server URL (leave empty to use placeholder)"
  type        = string
  default     = ""
}

# Cloud Run Configuration
variable "cloud_run_cpu" {
  description = "CPU allocation for Cloud Run (e.g., '1', '2', '4')"
  type        = string
  default     = "1"
}

variable "cloud_run_memory" {
  description = "Memory allocation for Cloud Run (e.g., '512Mi', '1Gi', '2Gi')"
  type        = string
  default     = "512Mi"
}

variable "cloud_run_timeout" {
  description = "Request timeout in seconds"
  type        = number
  default     = 300
}

variable "cloud_run_min_instances" {
  description = "Minimum number of instances (0 for scale-to-zero)"
  type        = string
  default     = "0"
}

variable "cloud_run_max_instances" {
  description = "Maximum number of instances"
  type        = string
  default     = "10"
}

variable "allow_public_access" {
  description = "Allow unauthenticated access to the Cloud Run service"
  type        = bool
  default     = true
}

# Application Configuration
variable "gemini_model" {
  description = "Gemini model to use for LLM chat"
  type        = string
  default     = "gemini-2.0-flash-exp"
}

# Cloud Build Trigger Configuration
variable "enable_cloud_build_trigger" {
  description = "Enable Cloud Build trigger for automatic deployments"
  type        = bool
  default     = false
}

variable "github_owner" {
  description = "GitHub repository owner/organization"
  type        = string
  default     = ""
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "sbb-chat-mcp"
}

variable "git_branch" {
  description = "Git branch to trigger builds on"
  type        = string
  default     = "main"
}

# Tags and Labels
variable "labels" {
  description = "Additional labels to apply to all resources"
  type        = map(string)
  default     = {}
}
