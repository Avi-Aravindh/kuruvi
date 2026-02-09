import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.CONVEX_DEPLOYMENT!);

async function addAuthTask() {
  const taskId = await client.mutation(api.tasks.create, {
    title: "Implement basic auth middleware for Kuruvi web UI",
    description: `Add simple password-based authentication to secure the Kuruvi web UI.

Requirements:
1. Create Next.js middleware that checks for authentication
2. Use environment variable KURUVI_PASSWORD for the password
3. Show a simple login form if not authenticated
4. Set a secure cookie on successful login
5. Protect all routes except the login page
6. Handle logout functionality

Implementation:
- Create middleware.ts with basic auth check
- Create a login page component
- Use bcrypt or similar to hash password comparison
- Set httpOnly, secure cookies
- Add KURUVI_PASSWORD to .env.example with placeholder

After implementation:
1. Build and test locally
2. Update .env.local with: KURUVI_PASSWORD=AviinKuruvi@1
3. Commit and push changes
4. Deploy to Vercel

Repository: https://github.com/Avi-Aravindh/kuruvi

Note: The password "AviinKuruvi@1" should be added to Vercel env variables after deployment.`,
    agent: "turing",
    priority: "high",
    createdBy: "helix",
  });

  console.log("✅ Auth implementation task created for Turing:", taskId);
}

addAuthTask();
