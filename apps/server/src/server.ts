import "dotenv/config";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { fastifyEnv } from "@fastify/env";

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, {
  origin: [process.env.WEB_ORIGIN || "http://scholaid.local:5000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
});

const spinUp = async () => {
  try {
    await fastify.listen({ port: 7000 });
    console.log("Server running on http://localhost:5000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

spinUp();
