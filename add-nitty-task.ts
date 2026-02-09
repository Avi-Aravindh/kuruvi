import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.CONVEX_DEPLOYMENT!);

async function addNittyTask() {
  try {
    const taskId = await client.mutation(api.tasks.create, {
      title: "Test Launch Log app - verify sign in flow and create GitHub issues",
      description: `Test the Launch Log application and focus on verifying the sign in flow.

Tasks:
1. Test the sign in flow thoroughly
2. Identify any bugs, issues, or UX problems
3. Create issues in the GitHub repo for each problem found
4. Include clear reproduction steps and screenshots where relevant
5. Report your findings in the #agents-workspace channel

Make sure to test edge cases and document everything clearly in GitHub issues.`,
      agent: "nitty",
      priority: "high",
      createdBy: "helix",
    });

    console.log("✅ Testing task created for Nitty:", taskId);
  } catch (error) {
    console.error("❌ Error creating task for Nitty:", error);
  }
}

addNittyTask();
