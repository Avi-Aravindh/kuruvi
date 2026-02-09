import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.CONVEX_DEPLOYMENT!);

async function registerAda() {
  try {
    const agentId = await client.mutation(api.agents.register, {
      name: "ada",
      displayName: "Ada",
      personality: "Methodical, detail-oriented, thinks in systems and patterns",
      specialization: "The Architect - designs system architecture and technical solutions",
    });

    console.log("✅ Ada registered successfully!");
    console.log("Agent ID:", agentId);
  } catch (error) {
    console.error("❌ Error registering Ada:", error);
  }
}

registerAda();
