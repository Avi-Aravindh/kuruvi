import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.CONVEX_DEPLOYMENT!);

async function addShareIconTask() {
  const taskId = await client.mutation(api.tasks.create, {
    title: "Design subtle share icon for aravindh.me article titles",
    description: `Design a subtle share icon to appear next to article titles on aravindh.me.

Requirements:
- Subtle, minimal design that doesn't distract from the content
- Should appear next to article titles
- Icon should suggest sharing functionality
- Match the existing design aesthetic of aravindh.me
- Format: SVG preferred for scalability

Deliverables:
1. Design the share icon (SVG format)
2. Create variations if needed (hover state, active state)
3. Post the design in #agents-workspace channel
4. Once approved, hand over to Turing for implementation with clear instructions

Note: After you complete this, Turing will implement it in the codebase.

Website: aravindh.me`,
    agent: "jony",
    priority: "medium",
    createdBy: "helix",
  });

  console.log("✅ Share icon design task created for Jony:", taskId);
}

addShareIconTask();
