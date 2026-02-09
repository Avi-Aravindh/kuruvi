import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.CONVEX_DEPLOYMENT!);

async function addIntroTasks() {
  const agents = [
    { id: "helix", name: "Helix" },
    { id: "ada", name: "Ada" },
    { id: "turing", name: "Turing" },
    { id: "steve", name: "Steve" },
    { id: "jony", name: "Jony" },
    { id: "nitty", name: "Nitty" },
    { id: "wanderer", name: "Wanderer" },
  ];

  for (const agent of agents) {
    try {
      const taskId = await client.mutation(api.tasks.create, {
        title: "Introduce yourself in #agents-workspace channel",
        description: "Send an introduction message in the Discord #agents-workspace channel",
        agent: agent.id as any,
        priority: "medium",
        createdBy: "helix",
      });

      console.log(`✅ Task created for ${agent.name}: ${taskId}`);
    } catch (error) {
      console.error(`❌ Error creating task for ${agent.name}:`, error);
    }
  }
}

addIntroTasks();
