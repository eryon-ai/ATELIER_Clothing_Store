# Jenkins Deployment Guide
**ATELIER Premium Fashion E-Commerce Platform**
*Enterprise DevOps Documentation*

---

## 1. Jenkins Pipeline Architecture

To deploy this Vite/React frontend application robustly, we will implement a multi-stage Jenkins Declarative Pipeline (`Jenkinsfile`).

**The Pipeline Flow:**
1.  **Checkout:** Pull the latest code from Git.
2.  **Setup Node.js:** Use the correct Node version (e.g., v20).
3.  **Install Dependencies:** Run `npm ci` for deterministic, clean installs.
4.  **Lint & Test:** Run ESLint and any unit tests (Jest/Vitest).
5.  **Build:** Run `npm run build` to generate the production-ready `dist/` folder using Vite.
6.  **Deploy:** Push the built artifacts to the hosting environment (AWS S3, Vercel, Nginx server, etc.).

---

## 2. Required Jenkins Plugins

Before setting up the job, ensure your Jenkins server has these plugins installed (Go to *Manage Jenkins* -> *Plugins*):

*   **Pipeline:** Core plugin for declarative pipelines.
*   **Git Plugin:** For source code management.
*   **NodeJS Plugin:** Crucial for building modern JS apps. This allows Jenkins to automatically install and manage specific Node.js versions.
*   **Credentials Binding Plugin:** To securely inject secrets (API keys, AWS credentials) into the pipeline.

---

## 3. Global Tool Configuration (Jenkins Admin)

You must configure the NodeJS plugin so the pipeline can use it:

1.  Go to **Manage Jenkins** -> **Tools**.
2.  Scroll down to **NodeJS installations**.
3.  Click **Add NodeJS**.
4.  Name it clearly: e.g., `NodeJS 20`.
5.  Check **Install automatically**.
6.  Select the desired version (e.g., `NodeJS 20.x.x`) from the dropdown.
7.  Save.

---

## 4. Setting up Credentials

If you are deploying to AWS S3, a remote server via SSH, or a platform like Vercel, you need to store those credentials securely in Jenkins.

1.  Go to **Manage Jenkins** -> **Credentials** -> **System** -> **Global credentials**.
2.  Click **Add Credentials**.
3.  Choose the type (e.g., `AWS Credentials` if the AWS plugin is installed, or `Secret text` for an API token).
4.  Give it an ID you will reference in the `Jenkinsfile` (e.g., `aws-s3-deploy-key`).

---

## 5. The `Jenkinsfile`

Create a file named `Jenkinsfile` in the root of your project repository. Here are three examples based on your deployment target.

### Example A: Deploying to a standard Linux Server (via SSH/Rsync)

*Requires the SSH Agent plugin.*

```groovy
pipeline {
    agent any

    // Refers to the NodeJS installation configured in Step 3
    tools {
        nodejs 'NodeJS 20'
    }

    environment {
        // Optional: Set environment variables for the build
        VITE_API_URL = 'https://api.atelier.com'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci' // Clean install based on package-lock.json
            }
        }

        stage('Lint & Test') {
            steps {
                // Adjust these based on your package.json scripts
                // sh 'npm run lint'
                // sh 'npm run test'
                echo "Skipping tests for now..."
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy via Rsync') {
            steps {
                // Uses SSH agent to authenticate with the remote server
                sshagent(credentials: ['ssh-deploy-key-id']) {
                    // Sync the contents of the Vite 'dist' folder to the Nginx web root
                    sh '''
                        rsync -avz --delete dist/ deploy_user@production-server-ip:/var/www/atelier/html/
                    '''
                }
            }
        }
    }
    
    post {
        always {
            cleanWs() // Clean up workspace to save disk space
        }
        success {
            echo "Deployment Successful!"
            // Could add Slack notification here
        }
        failure {
            echo "Deployment Failed!"
        }
    }
}
```

### Example B: Deploying to AWS S3 + CloudFront

*Often used for Single Page Applications. Requires the Pipeline: AWS Steps plugin.*

```groovy
pipeline {
    agent any
    tools { nodejs 'NodeJS 20' }

    environment {
        AWS_REGION = 'us-east-1'
        S3_BUCKET = 'atelier-production-frontend'
        CLOUDFRONT_ID = 'E1A2B3C4D5E6F7'
    }

    stages {
        stage('Checkout') { steps { checkout scm } }
        
        stage('Install') { steps { sh 'npm ci' } }
        
        stage('Build') { steps { sh 'npm run build' } }

        stage('Deploy to S3') {
            steps {
                withCredentials([aws(accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: 'aws-deploy-creds', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    // Sync 'dist' folder to S3 bucket
                    sh 'aws s3 sync dist/ s3://${S3_BUCKET} --delete --exact-timestamps'
                }
            }
        }
        
        stage('Invalidate CloudFront Cache') {
            steps {
                withCredentials([aws(accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: 'aws-deploy-creds', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    // Force CloudFront to fetch the new files
                    sh 'aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_ID} --paths "/*"'
                }
            }
        }
    }
}
```

---

## 6. Configuring the Jenkins Job

1.  In the Jenkins Dashboard, click **New Item**.
2.  Enter a name (e.g., `ATELIER-Frontend-Production`).
3.  Select **Pipeline** and click OK.
4.  Under the **Build Triggers** section:
    *   To deploy automatically on push: Check **GitHub hook trigger for GITScm polling** (Requires Webhook setup in GitHub/GitLab).
5.  Under the **Pipeline** section:
    *   Definition: Choose **Pipeline script from SCM**.
    *   SCM: Choose **Git**.
    *   Repository URL: Enter your repo URL.
    *   Credentials: Add/Select credentials to access your repo if it's private.
    *   Branches to build: Change to `*/main` or `*/production`.
    *   Script Path: Leave as `Jenkinsfile`.
6.  Save and click **Build Now** to test!

---

## 7. Important Vite-Specific Deployment Notes

Since this app uses Vite, pay attention to these settings:

1.  **Base URL (`vite.config.js`):** If you are deploying to the root of a domain (e.g., `https://atelier.com`), the default `base: '/'` in Vite is correct. If deploying to a subpath (e.g., `https://domain.com/atelier/`), you must update `vite.config.js` to `base: '/atelier/'`.
2.  **Environment Variables (`.env`):** Jenkins needs to inject environment variables at **build time**, not run time. Ensure variables like API URLs are prefixed with `VITE_` (e.g., `VITE_API_BASE_URL`) and injected during the `Build` stage in Jenkins.
3.  **Routing Configuration (Nginx/S3/Apache):** Because React Router handles client-side routing, if a user refreshes a page like `/products/shoes`, the server might return a 404. 
    *   **Nginx:** You must configure it to rewrite all requests to `index.html`: `try_files $uri $uri/ /index.html;`
    *   **AWS S3/CloudFront:** Configure custom error responses in CloudFront to route 404s back to `/index.html` with a 200 status code.
