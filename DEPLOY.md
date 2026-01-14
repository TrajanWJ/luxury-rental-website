# Deployment Instructions for Vercel

## Option 1: Vercel CLI (Recommended for quick testing)

1.  **Install Vercel CLI** (if not already installed):
    ```bash
    npm i -g vercel
    ```

2.  **Login to Vercel**:
    ```bash
    vercel login
    ```

3.  **Deploy**:
    Run the following command in your terminal effectively:
    ```bash
    vercel
    ```
    Follow the prompts to link your project.

4.  **Production Deployment**:
    To deploy to production (live URL):
    ```bash
    vercel --prod
    ```

## Option 2: Git Integration (Recommended for CI/CD)

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Go to the [Vercel Dashboard](https://vercel.com/dashboard).
3.  Click **"Add New..."** -> **"Project"**.
4.  Import your Git repository.
5.  Vercel will automatically detect Next.js and deploy.

## Configuration Notes

- **`vercel.json`**: A configuration file has been added to the root directory.
- **`next.config.mjs`**: Currently set to `unoptimized: true` for images. If you want to use Vercel's Image Optimization, verify your plan limits and consider removing this setting.
