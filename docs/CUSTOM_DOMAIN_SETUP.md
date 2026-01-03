# Custom Domain Setup for Staging Environment

This guide explains how to set up the custom domain `stage.swisstravelassistant.ch` for the staging Cloud Run service.

## Overview

The staging environment (`sbb-chat-mcp-staging`) is deployed to Google Cloud Run and can be accessed via a custom domain instead of the default Cloud Run URL.

## Prerequisites

- Access to the GCP project with appropriate permissions
- Access to DNS management for `swisstravelassistant.ch` domain
- `gcloud` CLI installed and configured

## Setup Steps

### 1. Create Domain Mapping

Run the setup script:

```bash
chmod +x scripts/setup-staging-domain.sh
./scripts/setup-staging-domain.sh
```

Or manually:

```bash
gcloud run domain-mappings create \
  --service=sbb-chat-mcp-staging \
  --domain=stage.swisstravelassistant.ch \
  --region=europe-west6
```

### 2. Get DNS Records

After creating the mapping, get the DNS records you need to configure:

```bash
gcloud run domain-mappings describe \
  --domain=stage.swisstravelassistant.ch \
  --region=europe-west6 \
  --format=json
```

The output will contain `resourceRecords` with the IP addresses you need.

### 3. Configure DNS Records

Add the following DNS records to your domain registrar or DNS provider:

#### A Record (IPv4)
- **Type**: A
- **Host/Name**: `stage` (or `stage.swisstravelassistant.ch` depending on your DNS provider)
- **Value**: The IPv4 address from the `resourceRecords` (usually starts with `216.239.`)
- **TTL**: 3600 (or 1 hour)

#### AAAA Record (IPv6)
- **Type**: AAAA
- **Host/Name**: `stage`
- **Value**: The IPv6 address from the `resourceRecords` (usually starts with `2001:`)
- **TTL**: 3600 (or 1 hour)

### 4. Wait for DNS Propagation

DNS changes can take up to 48 hours to propagate globally, but usually complete within:
- **Minutes**: For well-configured DNS providers
- **1-2 hours**: Most common case
- **Up to 48 hours**: Worst case scenario

### 5. Verify the Setup

Check DNS propagation:

```bash
# Check A record
nslookup stage.swisstravelassistant.ch

# Check HTTPS access
curl -I https://stage.swisstravelassistant.ch

# Detailed SSL check
curl -vI https://stage.swisstravelassistant.ch
```

### 6. Test the Application

Visit https://stage.swisstravelassistant.ch in your browser to confirm:
- ✅ SSL certificate is valid (automatic via Google Cloud)
- ✅ Application loads correctly
- ✅ No mixed content warnings

## SSL/TLS Certificate

Google Cloud Run automatically provisions and manages SSL/TLS certificates for custom domains using Let's Encrypt. This process:

- **Automatic**: No manual certificate setup needed
- **Free**: No additional cost
- **Auto-renewal**: Certificates renew automatically before expiration
- **Takes time**: Certificate provisioning can take 15-60 minutes after DNS propagation

## Troubleshooting

### Domain mapping not working

```bash
# Check domain mapping status
gcloud run domain-mappings describe \
  --domain=stage.swisstravelassistant.ch \
  --region=europe-west6

# Check service status
gcloud run services describe sbb-chat-mcp-staging \
  --region=europe-west6
```

### SSL certificate not provisioned

Wait 15-60 minutes after DNS propagation. If still not working:

```bash
# Delete and recreate the mapping
gcloud run domain-mappings delete \
  --domain=stage.swisstravelassistant.ch \
  --region=europe-west6

# Recreate
./scripts/setup-staging-domain.sh
```

### DNS not resolving

```bash
# Check DNS propagation globally
dig stage.swisstravelassistant.ch @8.8.8.8

# Check specific nameservers
dig stage.swisstravelassistant.ch @ns1.yourdnsprovider.com
```

Common issues:
- DNS records not saved properly
- Wrong subdomain (should be `stage` not `staging`)
- TTL too high causing slow updates
- Typo in IP addresses

### 404 or Service Not Found

- Verify the service name matches: `sbb-chat-mcp-staging`
- Check the service is deployed and running
- Verify the region matches: `europe-west6`

## Updating the Domain

If you need to point the domain to a different service:

```bash
gcloud run domain-mappings update \
  --service=new-service-name \
  --domain=stage.swisstravelassistant.ch \
  --region=europe-west6
```

## Removing the Domain

To remove the custom domain:

```bash
gcloud run domain-mappings delete \
  --domain=stage.swisstravelassistant.ch \
  --region=europe-west6
```

Then remove the DNS records from your DNS provider.

## Production Domain Setup

For production, follow the same steps but:
- Use service: `sbb-chat-mcp-production`
- Use domain: `swisstravelassistant.ch` or `www.swisstravelassistant.ch`

## Reference

- [Cloud Run Custom Domains Documentation](https://cloud.google.com/run/docs/mapping-custom-domains)
- [DNS Configuration Guide](https://cloud.google.com/dns/docs/quickstart)
- [SSL Certificate Troubleshooting](https://cloud.google.com/run/docs/troubleshooting#https-errors)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Cloud Run logs: `gcloud run services logs read sbb-chat-mcp-staging --region=europe-west6`
3. Check domain mapping events in GCP Console
