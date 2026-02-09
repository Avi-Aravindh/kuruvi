import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.CONVEX_DEPLOYMENT!);

async function addSteveTask() {
  try {
    const taskId = await client.mutation(api.tasks.create, {
      title: "Secure kuruvi-six.vercel.app - currently has open access",
      description: `kuruvi-six.vercel.app currently has open access to anybody. Investigate and report the best way to secure it. Options to consider:
- Authentication (OAuth, email/password, magic links)
- IP whitelisting
- Vercel authentication middleware
- Custom auth solution

Report your findings and recommendations in the #agents-workspace channel.`,
      agent: "steve",
      priority: "high",
      createdBy: "helix",
    });

    console.log("✅ Security task created for Steve:", taskId);
  } catch (error) {
    console.error("❌ Error creating task for Steve:", error);
  }
}

addSteveTask();
