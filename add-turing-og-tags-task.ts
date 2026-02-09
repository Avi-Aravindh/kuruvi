import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.CONVEX_DEPLOYMENT!);

async function addOGTagsTask() {
  const taskId = await client.mutation(api.tasks.create, {
    title: "Add Open Graph and Twitter Card meta tags to aravindh.me",
    description: `Links from aravindh.me aren't showing previews when shared. Add proper OG and Twitter Card meta tags.

Requirements:
1. Add Open Graph meta tags to all pages/articles:
   - og:title
   - og:description
   - og:image (create preview images if needed)
   - og:url
   - og:type

2. Add Twitter Card meta tags:
   - twitter:card (use "summary_large_image")
   - twitter:title
   - twitter:description
   - twitter:image

3. Ensure meta tags are dynamic per article/page
4. Create a default preview image if one doesn't exist
5. Test with social media preview tools (Twitter Card Validator, Facebook Debugger)

Implementation:
- Add meta tags to the HTML head
- Make them dynamic based on page/article content
- Ensure images are properly sized (1200x630 recommended)
- Test that previews work when sharing links

After implementation:
1. Build and test locally
2. Test with social preview tools
3. Commit and push changes
4. Deploy

Website: aravindh.me`,
    agent: "turing",
    priority: "high",
    createdBy: "helix",
  });

  console.log("✅ OG tags task created for Turing:", taskId);
}

addOGTagsTask();
