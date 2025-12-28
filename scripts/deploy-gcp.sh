#!/bin/bash
set -e

PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="europe-west6"
SERVICE_NAME="sbb-chat-mcp"
REPOSITORY="sbb-chat"

echo "🚀 Deploying SBB Chat MCP to Cloud Run..."

# Build and push image
echo "📦 Building Docker image..."
gcloud builds submit \
  --tag "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}:latest" \
  --project "${PROJECT_ID}"

# Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}:latest" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest,MCP_SERVER_URL=mcp-server-url:latest \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --project "${PROJECT_ID}"

echo ""
echo "✅ Deployment complete!"
echo "🌐 Service URL:"
gcloud run services describe "${SERVICE_NAME}" --region "${REGION}" --format 'value(status.url)' --project "${PROJECT_ID}"
