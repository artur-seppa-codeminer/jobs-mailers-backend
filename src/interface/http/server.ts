import fastifyJwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import fastify from "fastify";
import { config } from "../../config.js";
import { healthRoutes } from "./routes/healthRoutes.js";
import { taskRoutes } from "./routes/taskRoutes/taskRoutes.js";
import { userRoutes } from "./routes/userRoutes/userRoutes.js";
import { taskSchedulerUpdateStatus } from "./jobs/mail/scheduler.js";
import { createTaskWorker } from "./jobs/mail/worker.js";

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

  server.addHook('onReady', async () => {
    try {
      await createTaskWorker(server);
      await taskSchedulerUpdateStatus();

      server.log.info(`Scheduler initialized`);
      server.log.info('Task Worker initialized');
    } catch (error) {
      server.log.error('Error starting worker:', error);
    }
  });

  server.register(healthRoutes);
  server.register(userRoutes);
  server.register(taskRoutes);

  return server;
};
