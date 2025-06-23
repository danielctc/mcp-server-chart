import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from '../build/server';
import { createStreamableHttpHandler } from '../build/services';

const handler = createStreamableHttpHandler(createServer);

export default async function (req: VercelRequest, res: VercelResponse) {
  await handler(req, res);
} 