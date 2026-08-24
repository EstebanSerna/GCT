// Vite dev-server plugin: mounts the chat API as an in-process middleware
// so `npm run dev` alone is enough to develop against it locally. Not used
// in production — see prod.mjs for the real deployed server.
import { createChatHandler } from "./chatHandler.mjs";

export function chatApiPlugin() {
  return {
    name: "gct-chat-api",
    configureServer(server) {
      const handler = createChatHandler({ logger: server.config.logger });
      server.middlewares.use("/api/chat", handler);
    },
  };
}
