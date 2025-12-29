# Cloud Build Trigger Setup Guide

To have Google Cloud Platform (GCP) automatically fetch code from GitHub, compile it, and publish it, follow these steps to set up a Cloud Build Trigger.

## Step 1: Connect GitHub Repository (2nd Gen)

1.  In the GCP Console, go to **Cloud Build** > **Repositories**.
2.  Select **2nd Gen** tab.
3.  Click **Create Connection**.
4.  Select **GitHub** as the provider.
5.  Follow the OAuth flow to authorize Google Cloud Build to access your GitHub repositories.
6.  Once connected, click **Link Repository** and select the `sbb-chat-mcp` repository.

## Step 2: Create a Build Trigger

1.  Go to **Cloud Build** > **Triggers**.
2.  Click **Create Trigger**.
3.  **Name**: `deploy-sbb-chat-mcp-main`
4.  **Region**: `europe-west6` (or your preferred region)
5.  **Event**: Push to a branch
6.  **Repository**: Select the repository linked in Step 1.
7.  **Branch**: `^main$`
8.  **Configuration**: Cloud Build configuration file (yaml or json)
9.  **Cloud Build configuration file location**: `cloudbuild.yaml`
10. **Service Account**: Ensure the selected service account has the following roles:
    - Cloud Run Admin
    - Secret Manager Secret Accessor
    - Artifact Registry Writer
    - Service Account User
11. Click **Create**.

## Step 3: Verify

1.  Push a new commit to the `main` branch on GitHub.
2.  Check the **Cloud Build** > **History** tab to see the build running.
3.  Once finished, your application will be automatically deployed to Cloud Run.
