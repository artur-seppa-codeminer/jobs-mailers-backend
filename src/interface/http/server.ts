import fastifyJwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import fastify from "fastify";
import { config } from "../../config.js";
import { healthRoutes } from "./routes/healthRoutes.js";
import { taskRoutes } from "./routes/taskRoutes/taskRoutes.js";
import { userRoutes } from "./routes/userRoutes/userRoutes.js";

export const makeServer = async () => {
  const server = fastify({ logger: config.http.logger[config.env] });

  server.register(swagger, {
    openapi: {
      info: {
        title: "DunderTasks API",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });
  server.register(swaggerUi, { routePrefix: "/docs" });

  server.get("/", async (_request, reply) => {
    return reply.redirect("/docs", 301);
  });

  await server.register(fastifyJwt, {
    secret: config.secrets.jwtSecret,
  });

  server.register(healthRoutes);
  server.register(userRoutes);
  server.register(taskRoutes);

  return server;
};
