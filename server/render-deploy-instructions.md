# OpenSpace V2 Deployment Instructions for Render

## Setup Instructions

Follow these steps to deploy your OpenSpace application on Render:

### Option 1: Using render.yaml (Blueprint)

1. Push your code to GitHub with the updated `render.yaml` in the root directory
2. Log in to Render and select "New Blueprint" from the dashboard
3. Connect your GitHub repository
4. Select the repository containing this project
5. Render will automatically detect the `render.yaml` file and set up the services

### Option 2: Manual Setup

#### For the Server:

1. Log in to Render dashboard
2. Click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service with these settings:

   - **Name**: `openspace-server` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `cd server && chmod +x render-build.sh && ./render-build.sh`
   - **Start Command**: `cd server && node dist/server.js`
   - **Root Directory**: (leave empty to use repository root)

5. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGO_URL`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_KEY`: Your Supabase key
   - `SUPABASE_BUCKET`: `openspace-images` (or your preferred bucket name)
   - `EMAIL_HOST`: Your SMTP host
   - `EMAIL_PORT`: Your SMTP port
   - `EMAIL_USER`: Your email username
   - `EMAIL_PASSWORD`: Your email password
   - `VERIFIED_SENDER`: Your verified sender email address

#### For the Client:

1. Create another web service
2. Configure with these settings:

   - **Name**: `openspace-client` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Start Command**: `cd client && npm run preview`
   - **Root Directory**: (leave empty to use repository root)

3. Add environment variables:
   - `NODE_ENV`: `production`
   - `VITE_API_URL`: URL of your server service (will be available after server deployment)

## Troubleshooting

If you encounter build issues:

1. Check Render logs for specific error messages
2. Ensure all environment variables are properly set
3. Make sure TypeScript is available during the build process
4. Verify MongoDB connection is accessible from Render

For persistent TypeScript build issues, try using the global install approach:

```bash
npm install -g typescript && npx tsc -p tsconfig.deploy.json
```

## Post-Deployment

After successful deployment:

1. Verify that your server API endpoints are accessible
2. Check that MongoDB connection is working
3. Ensure Supabase storage integration is functioning
4. Test user authentication flow
5. Connect your client application to the deployed server API
