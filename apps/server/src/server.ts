import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/auth/index.js";
import { inviteRoutes } from "@/routes/invites.js";
import { institutionRoutes } from "@/routes/institutions.js";
import { matricRoutes } from "@/routes/matric.js";
import { userRoutes } from "@/routes/users.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: (process.env.ALLOWED_ORIGINS ?? "http://scholaid.co")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// better-auth — using Fetch API handler as per official Fastify docs
app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const headers = fromNodeHeaders(request.headers);
    const req = new Request(url.toString(), {
      method: request.method,
      headers,
      ...(request.body ? { body: JSON.stringify(request.body) } : {}),
    });
    const response = await auth.handler(req);
    reply.status(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));
    return reply.send(response.body ? await response.text() : null);
  },
});

await app.register(inviteRoutes);
await app.register(institutionRoutes);
await app.register(matricRoutes);
await app.register(userRoutes);

app.get("/", async () => ({ message: "Welcome to Scholaid!" }));

app.setErrorHandler((error: unknown, _req, reply) => {
  const err = error as { statusCode?: number; message?: string; name?: string };
  const statusCode = err.statusCode ?? 500;
  if (statusCode >= 500) {
    app.log.error(error);
    return reply.status(500).send({
      statusCode: 500,
      message: "An unexpected error occurred.",
      error: "Internal Server Error",
    });
  }
  return reply.status(statusCode).send({
    statusCode,
    message: err.message ?? "An error occurred.",
    error: err.name ?? "Error",
  });
});

const port = Number(process.env.PORT ?? 5000);
await app.listen({ port, host: "0.0.0.0" });
console.log(`Server running on http://0.0.0.0:${port}`);
