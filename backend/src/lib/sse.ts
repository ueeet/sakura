import { Request, Response } from "express";

type SSEClient = { id: string; res: Response };
const clients: SSEClient[] = [];

export function addSSEClient(req: Request, res: Response): void {
  const clientId = Date.now().toString();
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: "connected", clientId })}\n\n`);
  clients.push({ id: clientId, res });

  const heartbeat = setInterval(() => res.write(": heartbeat\n\n"), 30000);
  req.on("close", () => {
    clearInterval(heartbeat);
    const i = clients.findIndex((c) => c.id === clientId);
    if (i !== -1) clients.splice(i, 1);
  });
}

export function broadcast(event: string, data: unknown): void {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((c) => c.res.write(message));
}
