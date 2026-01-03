# Use Netlify DNS with Google Cloud Run Deployment

This guide shows how to use **Netlify for DNS management** while deploying to **Google Cloud Run**.

## Why This Setup?

- **Netlify DNS**: Easy-to-use dashboard for DNS management
- **Google Cloud Run**: Your preferred deployment platform with existing infrastructure
- **Best of both**: Simple DNS + Powerful deployment

## Architecture

```
Domain Registration (Your Registrar)
          ↓
    Netlify DNS
          ↓
  Google Cloud Run
(Your Application)
```

## Step 1: Set Up Netlify DNS

### Option A: Transfer Domain to Netlify

1. **Go to Netlify** → [app.netlify.com](https://app.netlify.com)
2. **Domains** → **Add or register domain**
3. **Transfer domain**: `swisstravelassistant.ch`
4. Follow Netlify's domain transfer process

### Option B: Use Netlify DNS Only (Recommended)

1. **Go to Netlify** → Domains → **Add a domain you already own**
2. **Enter**: `swisstravelassistant.ch`
3. **Netlify will provide nameservers**:
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```
   (Your actual nameservers will be different)

4. **Update nameservers at your domain registrar**:
   - Log in to where you bought `swisstravelassistant.ch`
   - Find DNS/Nameserver settings
   - Replace existing nameservers with Netlify's nameservers
   - Save changes

5. **Wait for propagation**: 24-48 hours (usually faster)

## Step 2: Deploy to Google Cloud Run

Deploy your application to Cloud Run (existing setup):

```bash
# Option A: Using the automated script
./scripts/setup-staging-domain.sh

# Option B: Using gcloud directly
gcloud run deploy sbb-chat-mcp-staging \
  --image=gcr.io/PROJECT_ID/sbb-chat-mcp:latest \
  --region=europe-west6 \
  --platform=managed
```

Get the Cloud Run service URL:

```bash
gcloud run services describe sbb-chat-mcp-staging \
  --region=europe-west6 \
  --format='value(status.url)'
```

You'll get something like: `https://sbb-chat-mcp-staging-xxx-ew.a.run.app`

## Step 3: Configure DNS in Netlify

### Add DNS Records for Cloud Run

1. **Go to Netlify** → Domains → `swisstravelassistant.ch` → **DNS settings**

2. **For the staging subdomain**, you have two options:

#### Option A: CNAME Record (Simpler)

**Note**: Google Cloud Run requires domain mapping first (see Step 4)

```
Type: CNAME
Name: stage
Value: ghs.googlehosted.com
TTL: 3600
```

#### Option B: A Record (Direct IP)

Get Cloud Run's load balancer IP:

```bash
# After setting up domain mapping in Cloud Run
gcloud run domain-mappings describe \
  --domain=stage.swisstravelassistant.ch \
  --region=europe-west6
```

Add A record in Netlify:
```
Type: A
Name: stage
Value: [IP from Cloud Run]
TTL: 3600
```

## Step 4: Create Cloud Run Domain Mapping

You still need to tell Cloud Run about your custom domain:

```bash
gcloud run domain-mappings create \
  --service=sbb-chat-mcp-staging \
  --domain=stage.swisstravelassistant.ch \
  --region=europe-west6
```

This command will output the DNS records you need (should match what you added in Step 3).

## Step 5: Verify SSL Certificate

Google Cloud Run automatically provisions SSL certificates:

```bash
# Check certificate status
gcloud run domain-mappings describe \
  --domain=stage.swisstravelassistant.ch \
  --region=europe-west6 \
  --format="get(status.conditions)"
```

Wait for:
1. DNS propagation (15-60 minutes)
2. SSL certificate provisioning (15-60 minutes after DNS)

## Step 6: Test the Setup

```bash
# Check DNS resolution
nslookup stage.swisstravelassistant.ch

# Should point to Cloud Run
dig stage.swisstravelassistant.ch

# Test HTTPS
curl -I https://stage.swisstravelassistant.ch

# Test application
curl https://stage.swisstravelassistant.ch/api/health
```

## Complete Workflow

### Initial Setup (One Time)

1. ✅ Point domain to Netlify nameservers (at your registrar)
2. ✅ Deploy application to Cloud Run
3. ✅ Create Cloud Run domain mapping
4. ✅ Add DNS records in Netlify dashboard
5. ✅ Wait for DNS propagation and SSL

### Ongoing Deployments

```bash
# Just deploy to Cloud Run as usual
gcloud builds submit --config cloudbuild.yaml
```

DNS and SSL are already configured!

## Managing DNS in Netlify

### Add More Subdomains

In Netlify DNS settings:

**For production**:
```
Type: CNAME
Name: www
Value: ghs.googlehosted.com
```

**For API**:
```
Type: CNAME
Name: api
Value: ghs.googlehosted.com
```

Then create Cloud Run domain mappings for each:

```bash
gcloud run domain-mappings create \
  --service=sbb-chat-mcp-production \
  --domain=www.swisstravelassistant.ch \
  --region=europe-west6
```

### Other DNS Records

You can add any DNS records in Netlify:

**Email (MX records)**:
```
Type: MX
Priority: 10
Value: mail.example.com
```

**Verification (TXT records)**:
```
Type: TXT
Name: @
Value: google-site-verification=xxx
```

## Advantages of This Setup

✅ **Easy DNS Management**: Netlify's user-friendly dashboard
✅ **Powerful Hosting**: Google Cloud Run's scalability
✅ **Separate Concerns**: DNS separate from deployment
✅ **Flexibility**: Change hosting without changing DNS
✅ **SSL from Cloud Run**: Let's Encrypt via Google
✅ **No vendor lock-in**: Can move DNS or hosting independently

## Troubleshooting

### DNS Not Resolving

```bash
# Check if using Netlify nameservers
dig NS swisstravelassistant.ch

# Should show Netlify nameservers
# dns1.p01.nsone.net, etc.
```

If not:
- Verify nameservers at your registrar
- Wait up to 48 hours for propagation

### SSL Certificate Not Provisioning

```bash
# Check domain mapping status
gcloud run domain-mappings describe \
  --domain=stage.swisstravelassistant.ch \
  --region=europe-west6
```

Common issues:
- DNS not propagated yet (wait longer)
- Wrong DNS records (verify CNAME or A record)
- Domain mapping not created in Cloud Run

### 404 or Service Not Found

- Verify service is deployed: `gcloud run services list`
- Check domain mapping exists
- Verify DNS points to correct location

## Cost Breakdown

**Netlify DNS**:
- Free with any Netlify plan
- $0/month if only using DNS

**Google Cloud Run**:
- ~$5-10/month for staging (low traffic)
- Pay per use pricing

**Total**: ~$5-10/month

## Alternative: Netlify for Staging, Cloud Run for Production

You can also:
- Use Netlify for `stage.swisstravelassistant.ch` (full deployment)
- Use Cloud Run for `swisstravelassistant.ch` (production)

This gives you:
- Easy staging deploys via Git push
- Production on Cloud Run with your existing infrastructure

## Migration Path

If you want to move from Cloud Run to Netlify (or vice versa):

1. **Deploy to new platform** (test it works)
2. **Update DNS** in Netlify dashboard
3. **Wait for propagation** (1-2 hours)
4. **Verify new platform** is serving traffic
5. **Keep old platform** running for a few days
6. **Shut down old platform** when confident

## Support

- **Netlify DNS**: [docs.netlify.com/domains-https/netlify-dns/](https://docs.netlify.com/domains-https/netlify-dns/)
- **Cloud Run Custom Domains**: [cloud.google.com/run/docs/mapping-custom-domains](https://cloud.google.com/run/docs/mapping-custom-domains)
- **Cloud Run + External DNS**: [cloud.google.com/run/docs/mapping-custom-domains#dns_update](https://cloud.google.com/run/docs/mapping-custom-domains#dns_update)

## Quick Reference Commands

```bash
# Netlify: Get nameservers
# (View in Netlify dashboard → Domain settings)

# Cloud Run: Create domain mapping
gcloud run domain-mappings create \
  --service=sbb-chat-mcp-staging \
  --domain=stage.swisstravelassistant.ch \
  --region=europe-west6

# Cloud Run: Check mapping status
gcloud run domain-mappings describe \
  --domain=stage.swisstravelassistant.ch \
  --region=europe-west6

# DNS: Check propagation
dig stage.swisstravelassistant.ch
nslookup stage.swisstravelassistant.ch

# Test: Verify deployment
curl https://stage.swisstravelassistant.ch/api/health
```
