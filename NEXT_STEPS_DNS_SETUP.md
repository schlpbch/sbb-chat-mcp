# Next Steps: Complete DNS Setup for stage.swisstravelcompanion.ch

## Current Status

✅ **Completed:**
- Cloud Run service deployed: `swiss-travel-companion-staging`
- Service is healthy and accessible: https://swiss-travel-companion-staging-4oqpacjdyq-oa.a.run.app
- Domain added to Netlify: `swisstravelcompanion.ch`
- TXT record for Google verification added in Netlify DNS
- All configuration files updated with correct service name and domain

⏳ **Pending:**
- Nameserver propagation (1-4 hours typical, up to 48 hours)
- Google Search Console domain verification
- Cloud Run domain mapping creation
- CNAME record configuration in Netlify
- SSL certificate provisioning

## Step 1: Wait for Nameserver Propagation (1-4 hours)

**Check nameserver propagation:**

```bash
nslookup -type=NS swisstravelcompanion.ch
```

**Expected result** (when propagated):
```
Server:  dns.google
Address:  8.8.8.8

Non-authoritative answer:
swisstravelcompanion.ch nameserver = dns1.p01.nsone.net
swisstravelcompanion.ch nameserver = dns2.p01.nsone.net
swisstravelcompanion.ch nameserver = dns3.p01.nsone.net
swisstravelcompanion.ch nameserver = dns4.p01.nsone.net
```

**Current status:**
```
dns.google can't find swisstravelcompanion.ch: Non-existent domain
```

**Action required:** Ensure nameservers at your domain registrar are set to Netlify's nameservers.

## Step 2: Verify Domain in Google Search Console

**After DNS propagates**, verify the domain:

1. Go to: https://search.google.com/search-console
2. Click "Add Property"
3. Enter: `swisstravelcompanion.ch`
4. Select "DNS record" verification method
5. Verify the TXT record is present: `google-site-verification=JOf2NuTHGHYoVMtykgGMYgHyU4xkeFmKdGXXPrUJX3M`
6. Click **Verify**

**Check verification status:**
```bash
nslookup -type=TXT swisstravelcompanion.ch
```

Should show the verification TXT record.

## Step 3: Create Cloud Run Domain Mapping

**After domain verification**, create the domain mapping:

```bash
gcloud beta run domain-mappings create \
  --service=swiss-travel-companion-staging \
  --domain=stage.swisstravelcompanion.ch \
  --region=europe-west6 \
  --project=swiss-travel-companion-staging
```

**Verify domain mapping:**
```bash
gcloud run domain-mappings describe \
  --domain=stage.swisstravelcompanion.ch \
  --region=europe-west6 \
  --project=swiss-travel-companion-staging
```

## Step 4: Add CNAME Record in Netlify

In Netlify dashboard:

1. Go to: **Domains** → `swisstravelcompanion.ch` → **DNS settings**
2. Click **Add new record**
3. Configure:
   - **Record type**: CNAME
   - **Name**: stage
   - **Value**: ghs.googlehosted.com
   - **TTL**: 3600
4. Click **Save**

## Step 5: Wait for SSL Certificate (15-60 minutes)

Google Cloud Run will automatically provision an SSL certificate after the domain mapping is created and DNS is resolving.

**Check SSL status:**
```bash
gcloud run domain-mappings describe \
  --domain=stage.swisstravelcompanion.ch \
  --region=europe-west6 \
  --project=swiss-travel-companion-staging \
  --format="get(status.conditions)"
```

Look for `CertificateProvisioned` status.

## Step 6: Verify Final Setup

**Test DNS resolution:**
```bash
nslookup stage.swisstravelcompanion.ch
```

**Test HTTP redirect:**
```bash
curl -I http://stage.swisstravelcompanion.ch
```

**Test HTTPS:**
```bash
curl -I https://stage.swisstravelcompanion.ch
```

**Test application health:**
```bash
curl https://stage.swisstravelcompanion.ch/api/health
```

Expected: `{"status":"ok"}`

**Test in browser:**
https://stage.swisstravelcompanion.ch

## Timeline Estimates

- **Nameserver propagation**: 1-4 hours (up to 48 hours in rare cases)
- **Domain verification**: 5 minutes (after DNS propagates)
- **Domain mapping creation**: 2 minutes
- **CNAME record setup**: 2 minutes
- **SSL certificate**: 15-60 minutes (automatic)
- **Total**: 2-5 hours (mostly waiting)

## Troubleshooting

### DNS not resolving
- Verify nameservers at registrar point to Netlify
- Wait longer (propagation can take up to 48 hours)
- Check with multiple DNS servers: `nslookup stage.swisstravelcompanion.ch 8.8.8.8`

### Domain verification fails
- Ensure TXT record is visible: `nslookup -type=TXT swisstravelcompanion.ch`
- Wait for DNS propagation first
- Try verifying again after waiting 15 minutes

### SSL certificate fails
- Ensure DNS is fully propagated first
- Check domain mapping status for errors
- Try deleting and recreating domain mapping

### 404 errors
- Verify Cloud Run service is running: `gcloud run services describe swiss-travel-companion-staging --region=europe-west6`
- Check Cloud Run logs for errors
- Verify service name matches in domain mapping

## Documentation

- **Quick Start**: [NETLIFY_DNS_QUICKSTART.md](NETLIFY_DNS_QUICKSTART.md)
- **Full Setup**: [SETUP_COMPLETE.md](SETUP_COMPLETE.md)
- **Deployment Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **Setup Script**: [scripts/setup-netlify-dns.sh](scripts/setup-netlify-dns.sh)

## Key Configuration

- **GCP Project**: swiss-travel-companion-staging
- **Region**: europe-west6
- **Service**: swiss-travel-companion-staging
- **Current URL**: https://swiss-travel-companion-staging-4oqpacjdyq-oa.a.run.app
- **Target URL**: https://stage.swisstravelcompanion.ch
- **Root Domain**: swisstravelcompanion.ch
- **Verification TXT**: google-site-verification=JOf2NuTHGHYoVMtykgGMYgHyU4xkeFmKdGXXPrUJX3M
