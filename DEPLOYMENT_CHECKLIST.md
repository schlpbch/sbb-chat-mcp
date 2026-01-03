# Deployment Checklist: Netlify DNS + Cloud Run

Use this checklist to track your deployment progress.

## Prerequisites

- [ ] Google Cloud project with billing enabled
- [ ] Application deployed to Cloud Run (`sbb-chat-mcp-staging`)
- [ ] Netlify account (free tier is fine)
- [ ] Access to domain registrar for `swisstravelassistant.ch`

## Phase 1: Netlify DNS Setup

### Add Domain to Netlify (5 minutes)

- [ ] Go to [app.netlify.com](https://app.netlify.com)
- [ ] Navigate to **Domains** → **Add a domain you already own**
- [ ] Enter domain: `swisstravelassistant.ch`
- [ ] Note down the 4 nameservers Netlify provides

**Netlify Nameservers** (write them here):
```
1. _____________________________
2. _____________________________
3. _____________________________
4. _____________________________
```

### Update Domain Registrar (10 minutes)

- [ ] Log in to your domain registrar
- [ ] Find DNS/Nameserver settings
- [ ] Replace existing nameservers with Netlify's nameservers
- [ ] Save changes
- [ ] Note the time (for tracking propagation)

**Time updated**: _______________

## Phase 2: Cloud Run Configuration

### Verify Service Deployment (2 minutes)

```bash
gcloud run services describe sbb-chat-mcp-staging \
  --region=europe-west6 \
  --format='value(status.url)'
```

- [ ] Service exists and is running
- [ ] Service URL: _________________________________

### Create Domain Mapping (5 minutes)

Run the automated script:
```bash
./scripts/setup-netlify-dns.sh
```

Or manually:
```bash
gcloud run domain-mappings create \
  --service=sbb-chat-mcp-staging \
  --domain=stage.swisstravelassistant.ch \
  --region=europe-west6
```

- [ ] Domain mapping created successfully
- [ ] No errors in output

## Phase 3: Netlify DNS Configuration

### Add CNAME Record (5 minutes)

In Netlify dashboard:

1. Go to **Domains** → `swisstravelassistant.ch` → **DNS settings**
2. Click **Add new record**
3. Configure:
   - **Record type**: CNAME
   - **Name**: stage
   - **Value**: ghs.googlehosted.com
   - **TTL**: 3600
4. Click **Save**

- [ ] CNAME record added in Netlify
- [ ] Record shows in DNS settings list

## Phase 4: Verification & Testing

### Wait for DNS Propagation (15-60 minutes)

Check DNS every 15 minutes:

```bash
nslookup stage.swisstravelassistant.ch
```

- [ ] DNS resolves to Google servers
- [ ] No "server can't find" errors

**DNS propagated at**: _______________

### Wait for SSL Certificate (15-60 minutes after DNS)

Check certificate status:

```bash
gcloud run domain-mappings describe \
  --domain=stage.swisstravelassistant.ch \
  --region=europe-west6 \
  --format="get(status.conditions)"
```

- [ ] Certificate provisioned (no errors in status)
- [ ] Status shows "Ready" or similar

**SSL ready at**: _______________

### Test the Deployment

```bash
# Test HTTP redirect
curl -I http://stage.swisstravelassistant.ch

# Test HTTPS
curl -I https://stage.swisstravelassistant.ch

# Test application
curl https://stage.swisstravelassistant.ch/api/health
```

- [ ] HTTP redirects to HTTPS
- [ ] HTTPS responds with 200 OK
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Site loads in browser

**Site live at**: _______________

## Phase 5: Production Deployment (Optional)

### Set up Production Domain

Repeat for production:

- [ ] Create Cloud Run production service (or use existing)
- [ ] Create domain mapping for `swisstravelassistant.ch` or `www.swisstravelassistant.ch`
- [ ] Add CNAME in Netlify for production subdomain
- [ ] Verify DNS and SSL
- [ ] Test production site

## Troubleshooting Checklist

If DNS doesn't resolve:

- [ ] Verified nameservers are correct at registrar
- [ ] Waited at least 1 hour since nameserver update
- [ ] Checked with multiple DNS servers (`nslookup ... 8.8.8.8`)
- [ ] Verified CNAME record exists in Netlify

If SSL certificate fails:

- [ ] DNS is fully propagated first
- [ ] Waited at least 30 minutes after DNS propagation
- [ ] Checked domain mapping status for errors
- [ ] Tried deleting and recreating domain mapping

If site shows 404:

- [ ] Verified Cloud Run service is deployed and running
- [ ] Checked service name matches in domain mapping
- [ ] Verified region is correct (europe-west6)
- [ ] Checked Cloud Run logs for errors

## Post-Deployment Tasks

- [ ] Update documentation with live URL
- [ ] Test all application features on staging
- [ ] Set up monitoring/alerts (optional)
- [ ] Configure backup strategy (optional)
- [ ] Document rollback procedure

## Support Resources

- **Quick Start**: [NETLIFY_DNS_QUICKSTART.md](NETLIFY_DNS_QUICKSTART.md)
- **Full Guide**: [docs/NETLIFY_DNS_CLOUD_RUN.md](docs/NETLIFY_DNS_CLOUD_RUN.md)
- **Cloud Run Docs**: [cloud.google.com/run/docs/mapping-custom-domains](https://cloud.google.com/run/docs/mapping-custom-domains)
- **Netlify DNS Docs**: [docs.netlify.com/domains-https/netlify-dns/](https://docs.netlify.com/domains-https/netlify-dns/)

## Timeline Estimates

- **Netlify setup**: 15 minutes
- **Cloud Run config**: 10 minutes
- **DNS propagation**: 15-60 minutes
- **SSL provisioning**: 15-60 minutes
- **Total**: 1-2 hours (mostly waiting)

## Success Criteria

✅ Deployment is successful when:

1. DNS resolves correctly: `nslookup stage.swisstravelassistant.ch`
2. SSL certificate is valid and trusted
3. Site loads at: https://stage.swisstravelassistant.ch
4. Health check passes: `/api/health` returns OK
5. All application features work correctly

## Notes

Use this space for any notes, issues, or observations:

```
_______________________________________________________________

_______________________________________________________________

_______________________________________________________________

_______________________________________________________________
```
