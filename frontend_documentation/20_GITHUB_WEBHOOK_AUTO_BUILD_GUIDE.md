# GitHub Webhook & Auto-Build Setup Guide
**ATELIER Premium Fashion E-Commerce Platform**
*Enterprise DevOps Documentation — Document 20*

---

## The Problem with Local Jenkins

Jenkins is currently running on `http://localhost:8080/`. "Localhost" means it is only accessible from your own computer. 

When you run `git push`, the code goes to GitHub's servers on the internet. GitHub needs to send a "Webhook Ping" (a notification) to Jenkins telling it to start the build. However, GitHub cannot reach `localhost`. 

To fix this, we use a tool called **Ngrok**. Ngrok creates a temporary public internet URL that securely forwards traffic directly to your local Jenkins port 8080.

---

## Step 1: Expose Jenkins to the Internet using Ngrok

1. **Install Ngrok** on your Mac if you haven't already:
   ```bash
   brew install ngrok/ngrok/ngrok
   ```
2. **Start Ngrok** to forward port 8080 (where Jenkins is running):
   ```bash
   ngrok http 8080
   ```
3. **Copy the Public URL**: Ngrok will display a screen in your terminal. Look for the `Forwarding` line. It will look something like this:
   `https://a1b2-c3d4.ngrok-free.app -> http://localhost:8080`
   
   *Copy that `https://...ngrok-free.app` URL. This is now your Jenkins public address!*

---

## Step 2: Configure the Webhook in GitHub

Now we tell GitHub to send the ping to your new Ngrok URL whenever you push code.

1. Go to your GitHub repository in your browser: `https://github.com/eryon-ai/ATELIER_Clothing_Store`
2. Click on the **Settings** tab.
3. On the left sidebar, click on **Webhooks**.
4. Click the **Add webhook** button (top right).
5. Fill out the form exactly like this:
   - **Payload URL:** Paste your Ngrok URL and add `/github-webhook/` at the end. 
     *(Example: `https://a1b2-c3d4.ngrok-free.app/github-webhook/`)* — **Do not forget the trailing slash!**
   - **Content type:** Select `application/json`
   - **Secret:** Leave blank.
   - **Which events would you like to trigger this webhook?:** Select `Just the push event.`
   - Ensure the **Active** checkbox is ticked.
6. Click **Add webhook**.

---

## Step 3: Configure Jenkins to Listen for the Webhook

Now we must tell your Jenkins Job to auto-start when it receives this ping.

1. Open your Jenkins Dashboard (`http://localhost:8080/`).
2. Click on your job: **ATELIER-Frontend**.
3. Click **Configure** on the left menu.
4. Scroll down to the **Build Triggers** section.
5. Check the box that says: **GitHub hook trigger for GITScm polling**.
6. Scroll down to the bottom and click **Save**.

---

## Step 4: Test the Auto-Build!

Everything is now connected. Let's test it:

1. Open your code editor (VS Code).
2. Make a small, safe change (like adding a space to a README file or a simple comment in a file).
3. Commit and push the code:
   ```bash
   git add .
   git commit -m "chore: testing auto-build webhook"
   git push
   ```
4. Immediately look at your Jenkins dashboard in your browser. 
5. Within 2 to 5 seconds, you should automatically see a new Build (e.g., Build #5) start running under the **Build History** on the left side!

---

> [!WARNING]
> **Important Note about Ngrok:** The free version of Ngrok changes your public URL every time you restart the `ngrok http 8080` command. If you close your terminal and restart ngrok tomorrow, you will get a *new* URL, and you will have to update Step 2 (the GitHub Payload URL) again. 
> 
> *In a real enterprise production environment, Jenkins is hosted on a permanent cloud server (like AWS EC2) with a fixed IP address or domain name (e.g., `jenkins.atelier.com`), so the webhook URL never changes.*
