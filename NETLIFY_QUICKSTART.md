# Netlify Quick Start

Deploy to Netlify and set up `stage.swisstravelassistant.ch` in 15 minutes.

## Prerequisites

- Netlify account (sign up at [netlify.com](https://netlify.com))
- GitHub repository pushed
- Domain access for DNS configuration

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Deploy to Netlify

### Via Dashboard (Easiest)

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub and select `sbb-chat-mcp` repository
4. Configure:
   - Build command: `pnpm run build`
   - Publish directory: `.next`
5. Add environment variables:
   ```
   GOOGLE_GEMINI_API_KEY=your_key
   MCP_SERVER_URL_STAGING=your_mcp_server_url
   NEXT_PUBLIC_MCP_ENV=staging
   NODE_VERSION=24
   ```
6. Click **"Deploy site"**

### Via CLI

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify init
netlify deploy --prod
```

## 3. Add Custom Domain

1. In Netlify dashboard → **Domain management** → **Domains**
2. Click **"Add a domain"**
3. Enter: `stage.swisstravelassistant.ch`
4. Click **"Verify"**

## 4. Configure DNS

Add this CNAME record to your DNS provider:

```
Type: CNAME
Name: stage
Value: your-site-name.netlify.app
TTL: 3600
```

**Where to add**:
- Go to your domain registrar (where you bought `swisstravelassistant.ch`)
- Find DNS settings
- Add the CNAME record above

## 5. Enable HTTPS

1. In Netlify → **Domain management** → **HTTPS**
2. Wait for DNS to propagate (15-60 minutes)
3. Click **"Verify DNS configuration"**
4. Click **"Provision certificate"**
5. Wait 5-15 minutes for SSL

## 6. Verify

```bash
# Check DNS
nslookup stage.swisstravelassistant.ch

# Test site
curl https://stage.swisstravelassistant.ch/api/health
```

## Done! 🎉

Your site is now live at:
- **https://stage.swisstravelassistant.ch**
- **https://your-site-name.netlify.app**

## Next Steps

- Set up automatic deploys from `main` branch
- Enable deploy previews for PRs
- Configure monitoring and analytics

## Need Help?

See full documentation: [docs/NETLIFY_DEPLOYMENT.md](docs/NETLIFY_DEPLOYMENT.md)

## Troubleshooting

**Build fails?**
- Check environment variables in Netlify dashboard
- Review build log

**Domain not working?**
- Wait 1-2 hours for DNS propagation
- Verify CNAME record is correct

**SSL error?**
- Wait 15-30 minutes after DNS propagates
- Click "Renew certificate" in Netlify

## Netlify vs Cloud Run

✅ **Use Netlify if**:
- Want easy deployment (Git push = deploy)
- Need built-in CDN and edge functions
- Prefer dashboard-based management

✅ **Use Cloud Run if**:
- Need fine-grained resource control
- Already using GCP ecosystem
- Prefer container-based deployment
