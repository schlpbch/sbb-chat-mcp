# Netlify Deployment Guide

This guide explains how to deploy the SBB Travel Companion to Netlify and configure the custom domain `stage.swisstravelassistant.ch`.

## Prerequisites

- Netlify account (free tier works)
- GitHub repository connected to Netlify
- Domain `swisstravelassistant.ch` registered and accessible

## Step 1: Install Dependencies

First, install the Netlify Next.js plugin:

```bash
pnpm install
```

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended for first time)

1. **Log in to Netlify**: Go to [app.netlify.com](https://app.netlify.com)

2. **Import project**:
   - Click "Add new site" → "Import an existing project"
   - Connect to your GitHub repository
   - Select the `sbb-chat-mcp` repository

3. **Configure build settings**:
   - **Build command**: `pnpm run build`
   - **Publish directory**: `.next`
   - **Base directory**: (leave empty)

4. **Add environment variables** (Site settings → Environment variables):
   ```
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   MCP_SERVER_URL_STAGING=https://journey-service-mcp-staging-xxx.run.app
   NEXT_PUBLIC_MCP_ENV=staging
   NODE_VERSION=24
   ```

5. **Deploy**: Click "Deploy site"

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# Or deploy manually
netlify deploy --prod
```

## Step 3: Configure Custom Domain

### Add Domain to Netlify

1. **Go to Site settings**:
   - Navigate to Domain management → Domains
   - Click "Add a domain"
   - Enter: `stage.swisstravelassistant.ch`
   - Click "Verify"

2. **Netlify will provide DNS records**:
   - You'll see the DNS configuration needed

### Configure DNS Records

Add these records to your DNS provider (where you registered `swisstravelassistant.ch`):

#### Option 1: CNAME Record (Recommended)

```
Type: CNAME
Name: stage
Value: your-site-name.netlify.app
TTL: 3600
```

#### Option 2: A Record + AAAA Record

If your DNS provider doesn't support CNAME for subdomains:

```
Type: A
Name: stage
Value: 75.2.60.5
TTL: 3600
```

**Note**: Check Netlify's current IP addresses as they may change. Always use the values shown in your Netlify dashboard.

### Enable HTTPS

1. **Automatic SSL**:
   - Netlify automatically provisions SSL certificates via Let's Encrypt
   - Go to Domain management → HTTPS
   - Click "Verify DNS configuration"
   - Click "Provision certificate"

2. **Wait for propagation**:
   - DNS: 15-60 minutes
   - SSL certificate: 5-15 minutes after DNS propagates

## Step 4: Verify Deployment

### Check DNS Propagation

```bash
# Check CNAME record
nslookup stage.swisstravelassistant.ch

# Or use dig
dig stage.swisstravelassistant.ch
```

### Test the Site

```bash
# Check HTTP redirect to HTTPS
curl -I http://stage.swisstravelassistant.ch

# Check HTTPS
curl -I https://stage.swisstravelassistant.ch

# Full test
curl https://stage.swisstravelassistant.ch/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"..."}
```

## Step 5: Configure Deploy Settings

### Automatic Deploys

1. **Go to Build & deploy settings**
2. **Configure branch deploys**:
   - Production branch: `main`
   - Deploy previews: Enabled for all pull requests
   - Branch deploys: Enabled for staging branches

### Build Settings

The `netlify.toml` file configures:
- Build command: `pnpm run build`
- Publish directory: `.next`
- Node version: 24
- Next.js plugin: `@netlify/plugin-nextjs`

### Environment Variables by Context

You can set different variables for different deploy contexts:

**Production**:
```
MCP_SERVER_URL_STAGING=https://prod-server.example.com
NEXT_PUBLIC_MCP_ENV=production
```

**Deploy Preview** (for PRs):
```
MCP_SERVER_URL_STAGING=https://dev-server.example.com
NEXT_PUBLIC_MCP_ENV=preview
```

## Netlify vs Google Cloud Run

| Feature | Netlify | Google Cloud Run |
|---------|---------|------------------|
| **Deployment** | Git push → Auto deploy | Manual or CI/CD |
| **SSL** | Automatic (Let's Encrypt) | Automatic (Google-managed) |
| **Custom domain** | Easy setup via dashboard | gcloud CLI required |
| **Scaling** | Automatic (CDN) | Automatic (containers) |
| **Pricing** | Free tier available | Pay per use |
| **Build time** | ~2-5 minutes | ~5-10 minutes |
| **Cold starts** | Minimal (CDN) | 1-3 seconds |
| **Functions** | Netlify Functions | Cloud Run services |

## Troubleshooting

### Build Fails

Check the deploy log in Netlify dashboard:
```
Site settings → Deploys → [Failed deploy] → Deploy log
```

Common issues:
- Missing environment variables
- `pnpm` not installed (check Node version)
- Build timeout (increase in Site settings)

### Domain Not Working

```bash
# Check DNS
nslookup stage.swisstravelassistant.ch

# Check Netlify DNS configuration
netlify status --site your-site-name
```

Common issues:
- DNS not propagated (wait 1-2 hours)
- Wrong CNAME value
- DNS provider's CDN/proxy interfering

### SSL Certificate Error

1. **Check domain verification**:
   - Go to Domain management
   - Verify DNS is correctly configured
   - Click "Renew certificate"

2. **Wait for automatic provisioning**:
   - Can take up to 24 hours
   - Usually completes in 15-30 minutes

### 404 Errors

- Verify `publish` directory in `netlify.toml` is correct
- Check build output in deploy logs
- Ensure `.next` directory is generated

## Advanced Configuration

### Custom Headers

Already configured in `netlify.toml`:
- Security headers (CSP, X-Frame-Options)
- Cache control for static assets
- CORS headers (if needed)

### Redirects

To add custom redirects, edit `netlify.toml`:

```toml
[[redirects]]
  from = "/old-path"
  to = "/new-path"
  status = 301
```

### Serverless Functions

If you need custom serverless functions:

```bash
# Create function
mkdir -p .netlify/functions
# Add function files to .netlify/functions/
```

### Preview Deploys

Netlify automatically creates preview URLs for:
- Pull requests: `deploy-preview-123--your-site.netlify.app`
- Branch deploys: `branch-name--your-site.netlify.app`

## Monitoring

### Analytics

Enable Netlify Analytics:
1. Go to Analytics tab
2. Click "Enable analytics"
3. $9/month for detailed metrics

### Logs

View deploy logs:
```bash
netlify logs --site your-site-name
```

Or in dashboard:
- Deploys → [Specific deploy] → Deploy log

### Performance

Check Lighthouse scores:
```bash
lighthouse https://stage.swisstravelassistant.ch
```

## Rollback

To rollback to a previous deploy:

1. **Via Dashboard**:
   - Go to Deploys
   - Find the working deploy
   - Click options → "Publish deploy"

2. **Via CLI**:
   ```bash
   netlify deploy --alias rollback
   ```

## Cost Estimation

### Free Tier Includes:
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- Automatic SSL
- Deploy previews

### Paid Plans:
- **Starter** ($19/month): 400 GB bandwidth, 1000 build minutes
- **Pro** ($99/month): 1 TB bandwidth, 3500 build minutes

## Migration from Cloud Run

If migrating from Google Cloud Run:

1. **Keep both running** initially
2. **Test on Netlify** with staging domain
3. **Update DNS** when ready
4. **Monitor** for issues
5. **Scale down** Cloud Run if needed

## Support Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Next.js on Netlify](https://docs.netlify.com/frameworks/next-js/)
- [Netlify Community](https://answers.netlify.com)
- [Status Page](https://www.netlifystatus.com)

## Quick Commands Reference

```bash
# Deploy to production
netlify deploy --prod

# Open site
netlify open:site

# Open admin dashboard
netlify open:admin

# Check site status
netlify status

# View environment variables
netlify env:list

# Set environment variable
netlify env:set VARIABLE_NAME value

# Trigger build
netlify build

# Run locally
netlify dev
```
