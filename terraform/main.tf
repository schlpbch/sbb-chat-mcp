# Swiss Travel Companion - Terraform Configuration
# Google Cloud Platform Infrastructure

terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Provider Configuration
provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable Required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "translate.googleapis.com",
  ])

  service            = each.value
  disable_on_destroy = false
}

# Artifact Registry Repository
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = var.artifact_registry_repo_id
  description   = "Swiss Travel Companion container images"
  format        = "DOCKER"

  labels = {
    application = var.app_name
    environment = var.environment
    managed_by  = "terraform"
  }

  depends_on = [google_project_service.required_apis]
}

# Secret Manager - Gemini API Key
resource "google_secret_manager_secret" "gemini_api_key" {
  secret_id = "gemini-api-key"

  labels = {
    application = var.app_name
    environment = var.environment
    managed_by  = "terraform"
  }

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]

  lifecycle {
    ignore_changes = [labels]
  }
}

resource "google_secret_manager_secret_version" "gemini_api_key_version" {
  secret = google_secret_manager_secret.gemini_api_key.id

  # Note: This references the existing secret version
  # Do not update this - use gcloud to add new versions
  secret_data = var.gemini_api_key != "" ? var.gemini_api_key : "PLACEHOLDER_UPDATE_ME"

  lifecycle {
    ignore_changes = [secret_data]
  }
}

# Secret Manager - MCP Server URL
resource "google_secret_manager_secret" "mcp_server_url" {
  secret_id = "mcp-server-url"

  labels = {
    application = var.app_name
    environment = var.environment
    managed_by  = "terraform"
  }

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]

  lifecycle {
    ignore_changes = [labels]
  }
}

resource "google_secret_manager_secret_version" "mcp_server_url_version" {
  secret = google_secret_manager_secret.mcp_server_url.id

  # Note: This references the existing secret version
  # Do not update this - use gcloud to add new versions
  secret_data = var.mcp_server_url != "" ? var.mcp_server_url : "PLACEHOLDER_UPDATE_ME"

  lifecycle {
    ignore_changes = [secret_data]
  }
}

# Service Account for Cloud Run
resource "google_service_account" "cloudrun_sa" {
  account_id   = "${var.app_name}-${var.environment}-sa"
  display_name = "Service Account for ${var.app_name} ${var.environment}"
  description  = "Used by Cloud Run service to access secrets and other GCP services"
}

# IAM - Secret Manager Access
resource "google_secret_manager_secret_iam_member" "gemini_key_access" {
  secret_id = google_secret_manager_secret.gemini_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "mcp_url_access" {
  secret_id = google_secret_manager_secret.mcp_server_url.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# IAM - Cloud Build Service Account Permissions
data "google_project" "project" {}

resource "google_project_iam_member" "cloudbuild_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"

  depends_on = [google_project_service.required_apis]
}

resource "google_project_iam_member" "cloudbuild_sa_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"

  depends_on = [google_project_service.required_apis]
}

resource "google_project_iam_member" "cloudbuild_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"

  depends_on = [google_project_service.required_apis]
}

# IAM - Default Compute Service Account Permissions (Needed if Cloud Build uses it)
resource "google_project_iam_member" "compute_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"

  depends_on = [google_project_service.required_apis]
}

resource "google_project_iam_member" "compute_sa_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"

  depends_on = [google_project_service.required_apis]
}

# Cloud Run Service
resource "google_cloud_run_service" "app" {
  name     = "${var.app_name}-${var.environment}"
  location = var.region

  template {
    spec {
      service_account_name = google_service_account.cloudrun_sa.email

      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}/${var.app_name}:latest"

        ports {
          container_port = 8080
        }

        resources {
          limits = {
            cpu    = var.cloud_run_cpu
            memory = var.cloud_run_memory
          }
        }

        env {
          name = "GEMINI_API_KEY"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.gemini_api_key.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name = "GOOGLE_CLOUD_KEY"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.gemini_api_key.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name = "MCP_SERVER_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.mcp_server_url.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name  = "NEXT_PUBLIC_MCP_ENV"
          value = var.environment
        }

        env {
          name  = "NODE_ENV"
          value = var.environment == "production" ? "production" : "development"
        }

        env {
          name  = "GEMINI_MODEL"
          value = var.gemini_model
        }

        env {
          name  = "GCP_PROJECT_ID"
          value = var.project_id
        }
      }

      timeout_seconds = var.cloud_run_timeout
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale"      = var.cloud_run_min_instances
        "autoscaling.knative.dev/maxScale"      = var.cloud_run_max_instances
        "run.googleapis.com/client-name"        = "terraform"
        "run.googleapis.com/startup-cpu-boost"  = "true"
      }

      labels = {
        app         = var.app_name
        environment = var.environment
        managed_by  = "terraform"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true

  depends_on = [
    google_project_service.required_apis,
    google_artifact_registry_repository.repo,
  ]

  lifecycle {
    ignore_changes = [
      template[0].spec[0].containers[0].image,
      template[0].metadata[0].annotations["run.googleapis.com/operation-id"],
      template[0].metadata[0].annotations["client.knative.dev/user-image"],
      template[0].metadata[0].annotations["run.googleapis.com/client-name"],
      template[0].metadata[0].annotations["run.googleapis.com/client-version"],
      metadata[0].annotations["run.googleapis.com/operation-id"],
      metadata[0].annotations["client.knative.dev/user-image"],
      metadata[0].annotations["run.googleapis.com/client-name"],
      metadata[0].annotations["run.googleapis.com/client-version"],
      metadata[0].annotations["serving.knative.dev/creator"],
      metadata[0].annotations["serving.knative.dev/lastModifier"],
      metadata[0].labels["cloud.googleapis.com/location"],
    ]
  }
}

# IAM - Allow Public Access (unauthenticated)
resource "google_cloud_run_service_iam_member" "public_access" {
  count = var.allow_public_access ? 1 : 0

  service  = google_cloud_run_service.app.name
  location = google_cloud_run_service.app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Cloud Build Trigger (Optional - for CI/CD automation)
resource "google_cloudbuild_trigger" "app_trigger" {
  count = var.enable_cloud_build_trigger ? 1 : 0

  name        = "${var.app_name}-${var.environment}-trigger"
  description = "Build and deploy ${var.app_name} on push to ${var.git_branch}"

  github {
    owner = var.github_owner
    name  = var.github_repo
    push {
      branch = "^${var.git_branch}$"
    }
  }

  filename = "cloudbuild.yaml"

  substitutions = {
    _REGION      = var.region
    _SERVICE     = google_cloud_run_service.app.name
    _ENVIRONMENT = var.environment
  }

  included_files = [
    "src/**",
    "public/**",
    "package.json",
    "pnpm-lock.yaml",
    "next.config.ts",
    "tsconfig.json",
    "Dockerfile",
    "cloudbuild.yaml",
  ]

  depends_on = [google_project_service.required_apis]
}
