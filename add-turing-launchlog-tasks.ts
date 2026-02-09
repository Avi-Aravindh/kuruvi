import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.CONVEX_DEPLOYMENT!);

async function addTuringTasks() {
  const tasks = [
    {
      title: "LaunchLog: Implement RLS removal and API route auth (Issue #1)",
      description: `Remove all RLS policies from Supabase and implement authorization in Next.js API routes instead.

Decision made: Keep NextAuth + GitHub OAuth, remove RLS.

Steps:
1. Remove all RLS policies from Supabase database
2. Implement authorization checks in API routes
3. Test that authenticated operations work
4. Push to GitHub with clear commit message
5. Close issue #1 when done

Repository: https://github.com/heliosinnovations/launchlog`,
      priority: "urgent"
    },
    {
      title: "LaunchLog: Add sign out functionality (Issue #2 & #3)",
      description: `Add sign out button and functionality.

Steps:
1. Add sign out button to the UI
2. Implement sign out handler using NextAuth signOut()
3. Test sign out flow
4. Push to GitHub with clear commit message
5. Close issues #2 and #3 when done

Repository: https://github.com/heliosinnovations/launchlog`,
      priority: "high"
    },
    {
      title: "LaunchLog: Fix type safety for session properties (Issue #4)",
      description: `Fix type safety issues where session properties can be undefined.

Steps:
1. Add proper null/undefined checks for session properties
2. Update TypeScript types to reflect optional properties
3. Test that no runtime errors occur
4. Push to GitHub with clear commit message
5. Close issue #4 when done

Repository: https://github.com/heliosinnovations/launchlog`,
      priority: "medium"
    },
    {
      title: "LaunchLog: Add loading state in navigation (Issue #5)",
      description: `Add loading state to navigation during auth checks.

Steps:
1. Add loading indicator while session is being checked
2. Prevent UI flash during authentication
3. Test the loading experience
4. Push to GitHub with clear commit message
5. Close issue #5 when done

Repository: https://github.com/heliosinnovations/launchlog`,
      priority: "medium"
    },
    {
      title: "LaunchLog: Fix open redirect vulnerability (Issue #6)",
      description: `Fix security vulnerability in sign in redirect.

Steps:
1. Validate redirect URLs to prevent open redirects
2. Whitelist allowed redirect paths
3. Test that malicious redirects are blocked
4. Push to GitHub with clear commit message
5. Close issue #6 when done

Repository: https://github.com/heliosinnovations/launchlog`,
      priority: "high"
    },
    {
      title: "LaunchLog: Fix race condition in protected routes (Issue #7)",
      description: `Fix race condition in protected route redirects.

Steps:
1. Ensure session is loaded before redirect logic runs
2. Add proper loading states
3. Test that race condition is resolved
4. Push to GitHub with clear commit message
5. Close issue #7 when done

Repository: https://github.com/heliosinnovations/launchlog`,
      priority: "high"
    }
  ];

  for (const task of tasks) {
    try {
      const taskId = await client.mutation(api.tasks.create, {
        title: task.title,
        description: task.description,
        agent: "turing",
        priority: task.priority as any,
        createdBy: "helix",
      });

      console.log(`✅ Task created: ${task.title.split(':')[1].trim()}`);
      console.log(`   ID: ${taskId}`);
    } catch (error) {
      console.error(`❌ Error creating task:`, error);
    }
  }
}

addTuringTasks();
