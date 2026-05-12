import { Response } from "express";

let adminClient: Response | null = null;

export function connectAdmin(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  adminClient = res;

  const ping = setInterval(() => {
    res.write("event: ping\ndata: {}\n\n");
  }, 30_000);

  res.on("close", () => {
    adminClient = null;
    clearInterval(ping);
  });
}

export function sendToAdmin(data: object) {
  if (adminClient) {
    adminClient.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}
