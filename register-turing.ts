import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.CONVEX_DEPLOYMENT!);

async function registerTuring() {
  try {
    const agentId = await client.mutation(api.agents.register, {
      name: "turing",
      displayName: "Turing",
      personality: "Minimalist, precise, obsessed with elegance and correctness",
      specialization: "Efficiency Expert - writes minimal, elegant code with comprehensive testing",
    });

    console.log("✅ Turing registered successfully!");
    console.log("Agent ID:", agentId);
  } catch (error) {
    console.error("❌ Error registering Turing:", error);
  }
}

registerTuring();
