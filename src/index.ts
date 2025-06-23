#!/usr/bin/env node
import type { IncomingMessage, ServerResponse } from "node:http";
import { parseArgs } from "node:util";
import {
  createServer,
  runHTTPStreamableServer,
  runSSEServer,
  runStdioServer,
} from "./server";
import { createStreamableHttpHandler } from "./services";

let handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>;

// Check if running in a serverless environment like Vercel
if (process.env.VERCEL) {
  handler = createStreamableHttpHandler(createServer);
}

export default async function (req: IncomingMessage, res: ServerResponse) {
  if (handler) {
    return await handler(req, res);
  }
  // This part will only be executed if not in a serverless environment
  // and the file is required by another Node script.
  res.writeHead(500).end("Not configured for serverless environment");
}

// The CLI logic should only run when the script is executed directly
if (require.main === module) {
  // Parse command line arguments
  const { values } = parseArgs({
    options: {
      transport: {
        type: "string",
        short: "t",
        default: "stdio",
      },
      port: {
        type: "string",
        short: "p",
        default: "1122",
      },
      endpoint: {
        type: "string",
        short: "e",
        default: "", // We'll handle defaults per transport type
      },
      help: {
        type: "boolean",
        short: "h",
      },
    },
  });

  // Display help information if requested
  if (values.help) {
    console.log(`
MCP Server Chart CLI

Options:
  --transport, -t  Specify the transport protocol: "stdio", "sse", or "streamable" (default: "stdio")
  --port, -p       Specify the port for SSE or streamable transport (default: 1122)
  --endpoint, -e   Specify the endpoint for the transport:
                   - For SSE: default is "/sse"
                   - For streamable: default is "/mcp"
  --help, -h       Show this help message
  `);
    process.exit(0);
  }

  // Run in the specified transport mode
  const transport = values.transport.toLowerCase();

  if (transport === "sse") {
    const port = Number.parseInt(values.port as string, 10);
    // Use provided endpoint or default to "/sse" for SSE
    const endpoint = values.endpoint || "/sse";
    runSSEServer(endpoint, port).catch(console.error);
  } else if (transport === "streamable") {
    const port = Number.parseInt(values.port as string, 10);
    // Use provided endpoint or default to "/mcp" for streamable
    const endpoint = values.endpoint || "/mcp";
    runHTTPStreamableServer(endpoint, port).catch(console.error);
  } else {
    runStdioServer().catch(console.error);
  }
}
