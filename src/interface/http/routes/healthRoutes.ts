import type { FastifyInstance } from "fastify";

export function healthRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/health",
    {
      schema: {
        summary: "Health check",
        tags: ["Health"],
      },
    },
    async (_request, reply) => {
      return reply.send({ status: "ok" });
    },
  );
}
