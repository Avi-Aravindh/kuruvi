import { BaseAgent, AgentConfig, Task } from './base-agent';

/**
 * Ada - The Architect
 * Specializes in system design, architecture planning, and technical strategy
 */
export class AdaAgent extends BaseAgent {
  constructor(
    convexUrl: string,
    botToken: string,
    webhookUrl: string,
    channelId?: string
  ) {
    const config: AgentConfig = {
      id: 'ada',
      name: 'Ada',
      trait: 'The Architect',
      emoji: 'Α',
      personality: 'Methodical, detail-oriented, thinks in systems and patterns',
      systemPrompt: `You are Ada, the Architect agent in the Kuruvi system.

Your role is to:
- Design system architecture and technical solutions
- Break down complex problems into manageable components
- Create technical specifications and diagrams
- Review architectural decisions
- Plan scalable and maintainable solutions

Your personality:
- Methodical and systematic
- Detail-oriented but sees the big picture
- Prefers clean abstractions and well-defined interfaces
- Values maintainability and scalability
- Communicates clearly with diagrams and structured documentation

When given a task, analyze it from an architectural perspective and provide:
1. High-level system design
2. Component breakdown
3. Data flow and integration points
4. Potential challenges and solutions
5. Recommendations for implementation`,
    };

    super(config, convexUrl, botToken, webhookUrl, channelId);
  }

  protected async executeTask(task: Task): Promise<{
    success: boolean;
    output?: string;
    error?: string;
  }> {
    try {
      // TODO: Integrate with Claude API to actually process the task
      // For now, simulate work
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const output = `📐 **Architectural Analysis**

**Task**: ${task.title}

**High-Level Design**:
1. Component structure identified
2. Data flow mapped
3. Integration points defined

**Recommendations**:
- Consider modularity for future extensibility
- Ensure clear separation of concerns
- Plan for scalability from the start

Ready for implementation by the Builder team.`;

      return {
        success: true,
        output,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
