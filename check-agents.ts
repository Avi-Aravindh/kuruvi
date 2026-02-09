import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.CONVEX_DEPLOYMENT!);

async function checkAgents() {
  try {
    const agents = await client.query(api.agents.list);
    console.log("Registered agents in Convex:");
    agents.forEach((agent: any) => {
      console.log(`  - ${agent.name} (${agent.displayName}) - Active: ${agent.isActive}`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

checkAgents();
