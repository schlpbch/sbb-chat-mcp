# Custom Domain SSL Setup for stage.swisstravelcompanion.ch

## Current Status

✅ **Completed:**
- DNS propagated with Netlify nameservers
- TXT record for Google verification added
- CNAME record created: `stage.swisstravelcompanion.ch` → `swiss-travel-companion-staging-4oqpacjdyq-oa.a.run.app`
- Cloud Run service is healthy and publicly accessible
- Gemini API key updated in both local and Secret Manager

⚠️ **Issue:**
- CNAME points to Cloud Run service, but SSL certificate fails
- Cloud Run's auto-generated certificate is only for `*.run.app` domains
- Cannot use Cloud Run domain mappings in `europe-west6` region (not supported)

## Solution: Use Google Cloud Load Balancer with Managed SSL

Since Cloud Run domain mappings are not supported in `europe-west6`, we need to set up a Google Cloud Load Balancer with a Google-managed SSL certificate.

### Architecture

```
stage.swisstravelcompanion.ch (DNS A record)
    ↓
Google Cloud Load Balancer (Static IP)
    ↓
Managed SSL Certificate (auto-provisioned)
    ↓
Backend Service (Serverless NEG)
    ↓
Cloud Run Service (swiss-travel-companion-staging)
```

## Step-by-Step Setup

### 1. Reserve Static IP Address

```bash
gcloud compute addresses create stage-swisstravelcompanion-ip \
  --global \
  --project=swiss-travel-companion-staging
```

Get the IP address:
```bash
gcloud compute addresses describe stage-swisstravelcompanion-ip \
  --global \
  --project=swiss-travel-companion-staging \
  --format="get(address)"
```

### 2. Create Managed SSL Certificate

```bash
gcloud compute ssl-certificates create stage-swisstravelcompanion-ssl \
  --domains=stage.swisstravelcompanion.ch \
  --global \
  --project=swiss-travel-companion-staging
```

### 3. Create Serverless Network Endpoint Group (NEG)

```bash
gcloud compute network-endpoint-groups create stage-swisstravelcompanion-neg \
  --region=europe-west6 \
  --network-endpoint-type=serverless \
  --cloud-run-service=swiss-travel-companion-staging \
  --project=swiss-travel-companion-staging
```

### 4. Create Backend Service

```bash
gcloud compute backend-services create stage-swisstravelcompanion-backend \
  --global \
  --project=swiss-travel-companion-staging

gcloud compute backend-services add-backend stage-swisstravelcompanion-backend \
  --global \
  --network-endpoint-group=stage-swisstravelcompanion-neg \
  --network-endpoint-group-region=europe-west6 \
  --project=swiss-travel-companion-staging
```

### 5. Create URL Map

```bash
gcloud compute url-maps create stage-swisstravelcompanion-lb \
  --default-service=stage-swisstravelcompanion-backend \
  --global \
  --project=swiss-travel-companion-staging
```

### 6. Create HTTPS Target Proxy

```bash
gcloud compute target-https-proxies create stage-swisstravelcompanion-https-proxy \
  --url-map=stage-swisstravelcompanion-lb \
  --ssl-certificates=stage-swisstravelcompanion-ssl \
  --global \
  --project=swiss-travel-companion-staging
```

### 7. Create Forwarding Rule

```bash
gcloud compute forwarding-rules create stage-swisstravelcompanion-https-rule \
  --address=stage-swisstravelcompanion-ip \
  --global \
  --target-https-proxy=stage-swisstravelcompanion-https-proxy \
  --ports=443 \
  --project=swiss-travel-companion-staging
```

### 8. (Optional) Create HTTP to HTTPS Redirect

```bash
# Create HTTP URL map for redirect
gcloud compute url-maps import stage-swisstravelcompanion-lb-http \
  --global \
  --project=swiss-travel-companion-staging \
  --source=- <<EOF
name: stage-swisstravelcompanion-lb-http
defaultUrlRedirect:
  httpsRedirect: true
  redirectResponseCode: MOVED_PERMANENTLY_DEFAULT
EOF

# Create HTTP target proxy
gcloud compute target-http-proxies create stage-swisstravelcompanion-http-proxy \
  --url-map=stage-swisstravelcompanion-lb-http \
  --global \
  --project=swiss-travel-companion-staging

# Create HTTP forwarding rule
gcloud compute forwarding-rules create stage-swisstravelcompanion-http-rule \
  --address=stage-swisstravelcompanion-ip \
  --global \
  --target-http-proxy=stage-swisstravelcompanion-http-proxy \
  --ports=80 \
  --project=swiss-travel-companion-staging
```

### 9. Update DNS in Netlify

Replace the existing CNAME record with an A record:

**In Netlify DNS settings for `swisstravelcompanion.ch`:**

1. **Delete** the existing CNAME record for `stage`
2. **Add** a new A record:
   - **Type**: A
   - **Name**: `stage`
   - **Value**: `[IP from step 1]`
   - **TTL**: 3600

### 10. Wait for SSL Certificate Provisioning

Google-managed SSL certificates take **15-60 minutes** to provision after:
1. DNS A record is pointing to the load balancer IP
2. HTTP challenge verification completes

Check status:
```bash
gcloud compute ssl-certificates describe stage-swisstravelcompanion-ssl \
  --global \
  --project=swiss-travel-companion-staging \
  --format="get(managed.status)"
```

Status values:
- `PROVISIONING` - Certificate is being created
- `ACTIVE` - Certificate is ready (✅ Done!)
- `FAILED` - Check DNS and try again

### 11. Verify Setup

```bash
# Check DNS
nslookup stage.swisstravelcompanion.ch

# Test HTTPS
curl -I https://stage.swisstravelcompanion.ch

# Test health endpoint
curl https://stage.swisstravelcompanion.ch/api/health
```

Expected result: `{"status":"ok"}`

## Timeline

- **Active work**: 15-20 minutes (running all commands)
- **Waiting time**: 15-60 minutes (SSL certificate provisioning)
- **Total**: 30-80 minutes

## Cost Estimate

- **Load Balancer**: ~$18-25/month (forwarding rules + bandwidth)
- **Static IP**: $0/month (free when in use)
- **SSL Certificate**: $0/month (Google-managed, free)
- **Cloud Run**: ~$5-10/month (existing, no change)
- **Total**: ~$23-35/month

## Alternative: Simpler Option (No Custom Domain SSL)

If cost is a concern, you can:
1. Keep using `https://swiss-travel-companion-staging-4oqpacjdyq-oa.a.run.app` (has valid SSL)
2. Create a redirect/bookmark for easier access
3. Save ~$18-25/month on load balancer costs

## Documentation

- [Cloud Run with Load Balancer](https://cloud.google.com/run/docs/mapping-custom-domains#https-load-balancer)
- [Google-Managed SSL Certificates](https://cloud.google.com/load-balancing/docs/ssl-certificates/google-managed-certs)
- [Serverless NEGs](https://cloud.google.com/load-balancing/docs/negs/serverless-neg-concepts)

## Troubleshooting

### SSL Certificate stays in PROVISIONING
- Verify DNS A record points to correct IP
- Wait longer (can take up to 60 minutes)
- Check if domain is reachable via HTTP first

### 404 errors after setup
- Verify backend service health
- Check Cloud Run service is running
- Review load balancer logs

### Certificate FAILED status
- Ensure A record is correct
- Verify domain ownership
- Delete and recreate certificate

---

**Next Action**: Run the setup commands above to complete the custom domain with SSL configuration.
