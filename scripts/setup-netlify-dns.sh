#!/bin/bash

# Setup script for Netlify DNS + Google Cloud Run deployment
# This script helps configure the domain mapping for stage.swisstravelassistant.ch

set -e

echo "=========================================="
echo "Netlify DNS + Cloud Run Setup"
echo "=========================================="
echo ""

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}
REGION="europe-west6"
SERVICE_NAME="sbb-chat-mcp-staging"
DOMAIN="stage.swisstravelassistant.ch"
ROOT_DOMAIN="swisstravelassistant.ch"

echo "Configuration:"
echo "  GCP Project: ${PROJECT_ID:-[not set]}"
echo "  Region: $REGION"
echo "  Service: $SERVICE_NAME"
echo "  Domain: $DOMAIN"
echo ""

if [ -z "$PROJECT_ID" ]; then
  echo "⚠️  GCP_PROJECT_ID not set. Please set it:"
  echo "  export GCP_PROJECT_ID=your-project-id"
  echo ""
  read -p "Or enter project ID now: " PROJECT_ID
  export GCP_PROJECT_ID=$PROJECT_ID
fi

# Check if service exists
echo "Checking if Cloud Run service exists..."
if ! gcloud run services describe "$SERVICE_NAME" --region="$REGION" --project="$PROJECT_ID" &>/dev/null; then
  echo "❌ Error: Service '$SERVICE_NAME' not found in region '$REGION'"
  echo ""
  echo "Please deploy your service first:"
  echo "  gcloud builds submit --config cloudbuild.yaml"
  echo ""
  exit 1
fi

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --project="$PROJECT_ID" --format='value(status.url)')
echo "✅ Service found: $SERVICE_URL"
echo ""

# Step 1: Netlify DNS Setup Instructions
echo "=========================================="
echo "Step 1: Set up Netlify DNS"
echo "=========================================="
echo ""
echo "1. Go to https://app.netlify.com"
echo "2. Navigate to: Domains → Add a domain you already own"
echo "3. Enter: $ROOT_DOMAIN"
echo "4. Netlify will provide nameservers (usually 4 nameservers)"
echo ""
echo "Example nameservers:"
echo "  - dns1.p01.nsone.net"
echo "  - dns2.p01.nsone.net"
echo "  - dns3.p01.nsone.net"
echo "  - dns4.p01.nsone.net"
echo ""
echo "5. Update nameservers at your domain registrar with Netlify's nameservers"
echo "6. Wait for DNS propagation (1-48 hours, usually faster)"
echo ""
read -p "Press Enter when you've completed Step 1..."
echo ""

# Step 2: Create Cloud Run Domain Mapping
echo "=========================================="
echo "Step 2: Create Cloud Run Domain Mapping"
echo "=========================================="
echo ""

# Check if domain mapping already exists
if gcloud run domain-mappings describe --domain="$DOMAIN" --region="$REGION" --project="$PROJECT_ID" 2>/dev/null | grep -q "name:"; then
  echo "⚠️  Domain mapping already exists"
  read -p "Do you want to recreate it? (y/N): " RECREATE
  if [[ "$RECREATE" =~ ^[Yy]$ ]]; then
    echo "Deleting existing domain mapping..."
    gcloud run domain-mappings delete --domain="$DOMAIN" --region="$REGION" --project="$PROJECT_ID" --quiet
    echo "Creating new domain mapping..."
    gcloud run domain-mappings create \
      --service="$SERVICE_NAME" \
      --domain="$DOMAIN" \
      --region="$REGION" \
      --project="$PROJECT_ID"
  else
    echo "Keeping existing domain mapping"
  fi
else
  echo "Creating domain mapping for $DOMAIN..."
  gcloud run domain-mappings create \
    --service="$SERVICE_NAME" \
    --domain="$DOMAIN" \
    --region="$REGION" \
    --project="$PROJECT_ID"
fi

echo ""
echo "✅ Domain mapping configured!"
echo ""

# Step 3: Get DNS records
echo "=========================================="
echo "Step 3: DNS Configuration for Netlify"
echo "=========================================="
echo ""
echo "Add this DNS record in Netlify dashboard:"
echo ""
echo "  Go to: Netlify → $ROOT_DOMAIN → DNS settings"
echo ""
echo "  Add CNAME Record:"
echo "  -------------------"
echo "  Type: CNAME"
echo "  Name: stage"
echo "  Value: ghs.googlehosted.com"
echo "  TTL: 3600"
echo ""
echo "This CNAME record points your subdomain to Google's Cloud Run infrastructure."
echo ""
read -p "Press Enter when you've added the DNS record in Netlify..."
echo ""

# Step 4: Verify Setup
echo "=========================================="
echo "Step 4: Verify Setup"
echo "=========================================="
echo ""
echo "Checking DNS resolution..."
echo ""

# Check DNS
echo "DNS Lookup for $DOMAIN:"
if nslookup "$DOMAIN" 8.8.8.8 2>/dev/null | grep -q "Address:"; then
  echo "✅ DNS is resolving"
else
  echo "⚠️  DNS not yet propagated (this is normal, wait 15-60 minutes)"
fi
echo ""

# Check domain mapping status
echo "Domain Mapping Status:"
gcloud run domain-mappings describe \
  --domain="$DOMAIN" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --format="table(status.conditions[0].type,status.conditions[0].status,status.conditions[0].message)"
echo ""

# Final instructions
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. ⏳ Wait for DNS propagation (15-60 minutes)"
echo "   Check with: nslookup $DOMAIN"
echo ""
echo "2. ⏳ Wait for SSL certificate (automatic, 15-60 minutes after DNS)"
echo "   Check status:"
echo "   gcloud run domain-mappings describe --domain=$DOMAIN --region=$REGION"
echo ""
echo "3. ✅ Test your site:"
echo "   curl -I https://$DOMAIN"
echo "   curl https://$DOMAIN/api/health"
echo ""
echo "4. 🌐 Access your site:"
echo "   https://$DOMAIN"
echo ""
echo "Troubleshooting:"
echo "  - If DNS doesn't resolve: Check nameservers at registrar"
echo "  - If SSL fails: Wait longer, DNS must propagate first"
echo "  - If 404 errors: Verify service is deployed and running"
echo ""
echo "Full documentation: docs/NETLIFY_DNS_CLOUD_RUN.md"
echo ""
