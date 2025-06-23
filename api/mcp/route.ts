import { createMcpHandler } from '@vercel/mcp-adapter';
import { z } from 'zod';
import * as Charts from '../../build/charts';

const handler = createMcpHandler(server => {
  // Add all chart generation tools from your existing implementation
  Object.values(Charts).forEach(chart => {
    const toolName = chart.tool.name;
    const description = chart.tool.description;
    const schema = chart.tool.inputSchema;
    
    server.tool(
      toolName,
      description,
      schema,
      async (params) => {
        try {
          // Call the chart generation function
          const result = await chart.generate(params);
          return {
            content: [
              {
                type: 'text',
                text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error generating ${toolName}: ${error instanceof Error ? error.message : String(error)}`
              }
            ]
          };
        }
      }
    );
  });
});

export { handler as GET, handler as POST, handler as DELETE }; 