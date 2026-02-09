import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.CONVEX_DEPLOYMENT!);

async function addTask() {
  try {
    const taskId = await client.mutation(api.tasks.create, {
      title: "Introduce yourself in #agents-workspace channel",
      description: "Send an introduction message in the Discord #agents-workspace channel",
      agent: "turing",
      priority: "medium",
      createdBy: "helix",
    });

    console.log("✅ Task created successfully!");
    console.log("Task ID:", taskId);
  } catch (error) {
    console.error("❌ Error creating task:", error);
  }
}

addTask();
