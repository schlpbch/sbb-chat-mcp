# Deploying to Netlify

This guide walks you through deploying the SBB Chat MCP application to Netlify.

## Prerequisites

1. A [Netlify account](https://app.netlify.com/signup)
2. A [Google Gemini API key](https://makersuite.google.com/app/apikey)
3. Your repository pushed to GitHub, GitLab, or Bitbucket

## Deployment Steps

### 1. Connect Your Repository

1. Log in to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider and authorize Netlify
4. Select the `sbb-chat-mcp` repository

### 2. Configure Build Settings

Netlify should automatically detect the Next.js configuration from `netlify.toml`, but verify:

- **Build command**: `pnpm run build`
- **Publish directory**: `.next`
- **Node version**: `20`

### 3. Set Environment Variables

In the Netlify dashboard, go to **Site settings** → **Environment variables** and add:

| Variable Name | Value | Required |
|--------------|-------|----------|
| `GEMINI_API_KEY` | Your Gemini API key | ✅ Yes |
| `GEMINI_MODEL` | `gemini-2.0-flash` | ⚠️ Optional (has default) |
| `NEXT_PUBLIC_MCP_ENV` | `staging` | ⚠️ Optional (defaults to staging) |
| `NEXT_PUBLIC_MCP_SERVER_URL_STAGING` | MCP server URL | ⚠️ Optional (has default) |

**Important**: The `GEMINI_API_KEY` is required for the LLM chat functionality to work.

### 4. Deploy

1. Click **"Deploy site"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Your site will be live at `https://[random-name].netlify.app`

### 5. Custom Domain (Optional)

To use a custom domain:

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the DNS configuration instructions

## Troubleshooting

### Build Fails with "publish directory not found"

**Error**: `Your publish directory was not found at: /opt/build/repo/.next`

**Solution**: Ensure `netlify.toml` exists with the correct configuration (already included in this repo).

### Missing Environment Variables

**Error**: API calls fail or return 500 errors

**Solution**: Verify all required environment variables are set in Netlify dashboard.

### Build Command Not Found

**Error**: `pnpm: command not found`

**Solution**: Check that `netlify.toml` specifies `PNPM_VERSION = "9"` in the `[build.environment]` section.

## Monitoring

- **Build logs**: Available in the Netlify dashboard under **Deploys**
- **Function logs**: Available under **Functions** tab
- **Analytics**: Enable Netlify Analytics for traffic insights

## Continuous Deployment

Netlify automatically deploys when you push to your main branch. To customize:

1. Go to **Site settings** → **Build & deploy**
2. Configure branch deploys and deploy contexts
3. Set up deploy previews for pull requests

## Additional Resources

- [Netlify Next.js Documentation](https://docs.netlify.com/frameworks/next-js/)
- [Environment Variables Guide](https://docs.netlify.com/environment-variables/overview/)
- [Custom Domains](https://docs.netlify.com/domains-https/custom-domains/)
