#!/bin/bash
set -e

PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="europe-west6"
REPOSITORY="sbb-chat"

echo "🔧 Setting up GCP project for Cloud Run deployment..."

# Set project
gcloud config set project "${PROJECT_ID}"

# Enable required APIs
echo "📡 Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com

# Create Artifact Registry repository
echo "📦 Creating Artifact Registry repository..."
gcloud artifacts repositories create "${REPOSITORY}" \
  --repository-format=docker \
  --location="${REGION}" \
  --description="Swiss Travel Companion container images" \
  || echo "Repository already exists"

# Create secrets (you'll need to set values manually)
echo "🔐 Creating Secret Manager secrets..."
echo -n "your-gemini-api-key" | gcloud secrets create gemini-api-key \
  --data-file=- \
  --replication-policy="automatic" \
  || echo "Secret already exists"

echo -n "https://your-mcp-server-url" | gcloud secrets create mcp-server-url \
  --data-file=- \
  --replication-policy="automatic" \
  || echo "Secret already exists"

# Grant Cloud Run access to secrets
PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding mcp-server-url \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

echo "✅ GCP setup complete!"
echo ""
echo "Next steps:"
echo "1. Update secrets with actual values:"
echo "   echo -n 'YOUR_GEMINI_KEY' | gcloud secrets versions add gemini-api-key --data-file=-"
echo "   echo -n 'YOUR_MCP_URL' | gcloud secrets versions add mcp-server-url --data-file=-"
echo "2. Run: ./scripts/deploy-gcp.sh"
