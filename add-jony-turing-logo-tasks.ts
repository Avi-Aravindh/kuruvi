import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.CONVEX_DEPLOYMENT!);

async function addLogoTasks() {
  // Jony's task - design the logo and favicon
  const jonyTaskId = await client.mutation(api.tasks.create, {
    title: "Design new logo and favicon for Kuruvi",
    description: `Design a new logo and favicon for the Kuruvi agent system.

Requirements:
- Logo: Modern, clean design representing a team of AI agents
- Favicon: 32x32 and 16x16 versions
- Format: SVG for logo, ICO/PNG for favicon
- Style: Professional, tech-forward, represents collaboration

Deliverables:
1. Create logo files (SVG preferred)
2. Create favicon files (favicon.ico, favicon-16x16.png, favicon-32x32.png)
3. Save files in appropriate format
4. Post the designs in #agents-workspace channel
5. Once approved, pass to Turing for implementation

Repository: https://github.com/Avi-Aravindh/kuruvi`,
    agent: "jony",
    priority: "medium",
    createdBy: "helix",
  });

  console.log("✅ Logo design task created for Jony:", jonyTaskId);

  // Turing's task - implement the logo and favicon once Jony is done
  const turingTaskId = await client.mutation(api.tasks.create, {
    title: "Implement Kuruvi logo and favicon (after Jony completes design)",
    description: `Implement the new logo and favicon designed by Jony.

Steps:
1. Wait for Jony to complete the logo/favicon designs
2. Get the design files from Jony's output
3. Add logo to the Kuruvi web UI
4. Add favicon files to public directory
5. Update any references to old logo/favicon
6. Test that logo and favicon display correctly
7. Build and verify locally
8. Commit and push changes
9. Deploy to Vercel

Repository: https://github.com/Avi-Aravindh/kuruvi

⚠️ Do NOT start this task until Jony's logo design task is completed.`,
    agent: "turing",
    priority: "medium",
    createdBy: "helix",
  });

  console.log("✅ Logo implementation task created for Turing:", turingTaskId);
}

addLogoTasks();
