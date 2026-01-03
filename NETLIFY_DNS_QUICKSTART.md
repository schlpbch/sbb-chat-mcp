# Quick Start: Netlify DNS + Cloud Run Deployment

Use Netlify's easy DNS management with your Google Cloud Run deployment.

## Why?

- ✅ Netlify = Easy DNS dashboard
- ✅ Cloud Run = Your existing deployment infrastructure
- ✅ Best of both worlds!

## Setup (30 minutes)

### 1. Set Up Netlify DNS

**a) Add domain to Netlify**:
1. Go to [app.netlify.com](https://app.netlify.com) → Domains
2. Click "Add a domain you already own"
3. Enter: `swisstravelassistant.ch`

**b) Get Netlify nameservers**:

Netlify will show you nameservers like:
```
dns1.p01.nsone.net
dns2.p01.nsone.net
dns3.p01.nsone.net
dns4.p01.nsone.net
```

**c) Update at your domain registrar**:
1. Log in where you bought `swisstravelassistant.ch`
2. Find DNS/Nameserver settings
3. Replace with Netlify's nameservers
4. Save (propagation: 1-48 hours)

### 2. Deploy to Cloud Run

```bash
# Deploy your app (existing process)
gcloud builds submit --config cloudbuild.yaml

# Or use your existing deployment
# Your app is already running on Cloud Run!
```

### 3. Create Cloud Run Domain Mapping

```bash
gcloud run domain-mappings create \
  --service=sbb-chat-mcp-staging \
  --domain=stage.swisstravelassistant.ch \
  --region=europe-west6
```

This will output the DNS records needed.

### 4. Add DNS Record in Netlify

**In Netlify dashboard** → `swisstravelassistant.ch` → DNS:

Add CNAME record:
```
Type: CNAME
Name: stage
Value: ghs.googlehosted.com
TTL: 3600
```

### 5. Wait & Verify

**Wait for**:
- DNS propagation: 15-60 minutes
- SSL certificate: Automatic from Google (15-60 min)

**Test**:
```bash
# Check DNS
nslookup stage.swisstravelassistant.ch

# Test site
curl https://stage.swisstravelassistant.ch/api/health
```

## Done! 🎉

Your setup:
- **DNS**: Managed in Netlify dashboard (easy!)
- **Hosting**: Running on Google Cloud Run (powerful!)
- **SSL**: Automatic from Google (free!)

## Daily Use

### Deploy Updates
```bash
# Just deploy to Cloud Run as usual
gcloud builds submit --config cloudbuild.yaml
```

DNS stays the same!

### Manage DNS
- Log in to Netlify dashboard
- Add/edit DNS records with visual interface
- No command line needed!

## Add Production Domain

Repeat steps 3-4 for production:

```bash
# Cloud Run mapping
gcloud run domain-mappings create \
  --service=sbb-chat-mcp-production \
  --domain=swisstravelassistant.ch \
  --region=europe-west6
```

**Netlify DNS**:
```
Type: CNAME
Name: @ (or www)
Value: ghs.googlehosted.com
```

## Troubleshooting

**DNS not working?**
- Check nameservers are updated at registrar
- Wait up to 48 hours for propagation
- Run: `dig NS swisstravelassistant.ch`

**SSL error?**
- Wait 15-60 min after DNS propagates
- Check domain mapping: `gcloud run domain-mappings describe`

**404 error?**
- Verify service is deployed: `gcloud run services list`
- Check domain mapping exists

## Full Documentation

See [docs/NETLIFY_DNS_CLOUD_RUN.md](docs/NETLIFY_DNS_CLOUD_RUN.md) for complete guide.

## Costs

- **Netlify DNS**: Free
- **Cloud Run**: ~$5-10/month (low traffic)
- **Total**: ~$5-10/month
