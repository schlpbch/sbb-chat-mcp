# Staging Domain Setup - Quick Reference

## Setup Custom Domain for Staging

To expose the staging environment at https://stage.swisstravelassistant.ch:

### Step 1: Run the Setup Script

```bash
./scripts/setup-staging-domain.sh
```

### Step 2: Configure DNS

The script will output the DNS records you need. Add these to your DNS provider:

**A Record:**
- Host: `stage`
- Type: A
- Value: (IPv4 from script output)

**AAAA Record:**
- Host: `stage`
- Type: AAAA
- Value: (IPv6 from script output)

### Step 3: Wait & Verify

Wait 15-60 minutes for:
1. DNS propagation
2. SSL certificate provisioning

Then verify:
```bash
curl -I https://stage.swisstravelassistant.ch
```

## Current Configuration

- **Service**: `sbb-chat-mcp-staging`
- **Region**: `europe-west6`
- **Domain**: `stage.swisstravelassistant.ch`
- **SSL**: Automatic (Let's Encrypt)

## Quick Commands

### Check domain mapping status
```bash
gcloud run domain-mappings describe \
  --domain=stage.swisstravelassistant.ch \
  --region=europe-west6
```

### Check DNS propagation
```bash
nslookup stage.swisstravelassistant.ch
```

### Check service status
```bash
gcloud run services describe sbb-chat-mcp-staging \
  --region=europe-west6
```

### View logs
```bash
gcloud run services logs read sbb-chat-mcp-staging \
  --region=europe-west6
```

## Full Documentation

See [docs/CUSTOM_DOMAIN_SETUP.md](docs/CUSTOM_DOMAIN_SETUP.md) for:
- Detailed setup instructions
- Troubleshooting guide
- SSL certificate information
- Production domain setup

## Troubleshooting

**Domain not accessible?**
1. Check DNS propagation: `nslookup stage.swisstravelassistant.ch`
2. Wait 15-60 minutes after DNS configuration
3. Check domain mapping status (command above)

**SSL certificate error?**
1. Wait 15-60 minutes after DNS propagation
2. Certificate provisioning is automatic but takes time

**Service not found?**
1. Verify service is deployed: `gcloud run services list`
2. Check region matches: `europe-west6`

## Need Help?

1. Review [docs/CUSTOM_DOMAIN_SETUP.md](docs/CUSTOM_DOMAIN_SETUP.md)
2. Check Cloud Run logs
3. Verify DNS configuration in your DNS provider's dashboard
