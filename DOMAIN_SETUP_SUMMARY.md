# Domain Setup Summary

## Overview

This document summarizes the setup for deploying `stage.swisstravelassistant.ch` with three different approaches.

## Files Created

### Netlify DNS + Cloud Run (Recommended)
- **[NETLIFY_DNS_QUICKSTART.md](NETLIFY_DNS_QUICKSTART.md)** - 30-minute setup guide
- **[docs/NETLIFY_DNS_CLOUD_RUN.md](docs/NETLIFY_DNS_CLOUD_RUN.md)** - Complete guide for hybrid setup

### Netlify Full Deployment
- **[netlify.toml](netlify.toml)** - Netlify configuration
- **[NETLIFY_QUICKSTART.md](NETLIFY_QUICKSTART.md)** - 15-minute quick start guide
- **[docs/NETLIFY_DEPLOYMENT.md](docs/NETLIFY_DEPLOYMENT.md)** - Complete Netlify deployment guide
- **[package.json](package.json)** - Added `@netlify/plugin-nextjs`

### Google Cloud Run Only
- **[scripts/setup-staging-domain.sh](scripts/setup-staging-domain.sh)** - Automated domain mapping script
- **[STAGING_DOMAIN.md](STAGING_DOMAIN.md)** - Quick reference for Cloud Run domains
- **[docs/CUSTOM_DOMAIN_SETUP.md](docs/CUSTOM_DOMAIN_SETUP.md)** - Cloud Run custom domain guide

### General
- **[README.md](README.md)** - Updated with all deployment options

## Quick Start Guide

### Option 1: Netlify DNS + Cloud Run (Recommended)

**Perfect if**: You want easy DNS management with Cloud Run deployment.

1. **Add domain to Netlify** (DNS only)
2. **Update nameservers** at your registrar
3. **Deploy to Cloud Run** (existing setup)
4. **Add CNAME in Netlify** → points to Cloud Run
5. **Wait for SSL** (automatic)

**Time**: ~30 minutes
**Cost**: Free DNS + Cloud Run (~$5-10/month)

**Guide**: [NETLIFY_DNS_QUICKSTART.md](NETLIFY_DNS_QUICKSTART.md)

### Option 2: Netlify Full Deployment (Easiest)

**Perfect if**: You want the simplest deployment with automatic SSL and CDN.

1. **Deploy**:
   ```bash
   pnpm install
   netlify login
   netlify deploy --prod
   ```

2. **Add domain** in Netlify dashboard:
   - Domain management → Add domain: `stage.swisstravelassistant.ch`

3. **Configure DNS** (add CNAME record):
   ```
   Type: CNAME
   Name: stage
   Value: your-site-name.netlify.app
   ```

4. **Enable HTTPS** (automatic after DNS propagates)

**Time**: ~15 minutes
**Cost**: Free (up to 100GB bandwidth/month)

### Option 2: Google Cloud Run (Current Setup)

**Perfect if**: You prefer infrastructure as code or already use GCP.

1. **Deploy**:
   ```bash
   ./scripts/setup-staging-domain.sh
   ```

2. **Configure DNS** (add A and AAAA records):
   The script will show you the exact records to add.

3. **Wait for SSL** (automatic via Let's Encrypt)

**Time**: ~30 minutes
**Cost**: Pay per use (~$5-10/month for low traffic)

## Comparison

| Feature | Netlify | Google Cloud Run |
|---------|---------|------------------|
| **Setup time** | 15 minutes | 30 minutes |
| **SSL certificate** | Automatic (instant) | Automatic (15-60 min) |
| **CDN** | Built-in global CDN | Via Cloud CDN (extra setup) |
| **Git integration** | Built-in | Via Cloud Build |
| **Cold starts** | None (CDN) | 1-3 seconds |
| **Free tier** | 100GB/month | No free tier |
| **Scaling** | Automatic | Automatic |
| **Dashboard** | User-friendly | Technical |

## Recommendation

### Use Netlify if:
- ✅ You want the fastest setup
- ✅ You prefer a user-friendly dashboard
- ✅ You want built-in deploy previews for PRs
- ✅ You're okay with vendor lock-in to Netlify
- ✅ Your traffic is predictable and under 100GB/month

### Use Google Cloud Run if:
- ✅ You're already using GCP services
- ✅ You want fine-grained resource control
- ✅ You prefer infrastructure as code (Terraform)
- ✅ You need to stay within the Google Cloud ecosystem
- ✅ You have variable traffic patterns

## Next Steps

After choosing your deployment method:

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Follow the appropriate guide**:
   - Netlify: [NETLIFY_QUICKSTART.md](NETLIFY_QUICKSTART.md)
   - Cloud Run: [STAGING_DOMAIN.md](STAGING_DOMAIN.md)

3. **Configure environment variables**:
   - `GOOGLE_GEMINI_API_KEY`
   - `MCP_SERVER_URL_STAGING`
   - `NEXT_PUBLIC_MCP_ENV=staging`

4. **Test the deployment**:
   ```bash
   curl https://stage.swisstravelassistant.ch/api/health
   ```

## Support

- **Netlify issues**: See [docs/NETLIFY_DEPLOYMENT.md](docs/NETLIFY_DEPLOYMENT.md)
- **Cloud Run issues**: See [docs/CUSTOM_DOMAIN_SETUP.md](docs/CUSTOM_DOMAIN_SETUP.md)
- **General questions**: Check the README.md

## Migration Between Platforms

You can run both Netlify and Cloud Run simultaneously:

1. Deploy to both platforms
2. Test both URLs
3. Update DNS to point to your preferred platform
4. Keep the other as backup

To switch DNS:
- **To Netlify**: Change CNAME to point to `your-site.netlify.app`
- **To Cloud Run**: Change A/AAAA records to Cloud Run IPs
