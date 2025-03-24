import type { FastifyInstance } from "fastify";
import { authenticate } from "../../hooks/authenticate.js";
import { completeTaskHandler } from "./completeTaskHandler.js";
import { createTaskHandler } from "./createTaskHandler.js";
import { findTaskHandler } from "./findTaskHandler.js";
import { findTasksHandler } from "./findTasksHandler.js";
import { prioritizeTaskHandler } from "./prioritizeTaskHandler.js";
import { shareTaskHandler } from "./shareTaskHandler.js";

export function taskRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/tasks",
    {
      schema: {
        summary: "Find tasks",
        tags: ["Tasks"],
        querystring: {
          type: "object",
          properties: {
            completed: { type: "boolean" },
            priority: {
              type: "string",
              enum: ["NONE", "LOW", "MEDIUM", "HIGH"],
            },
            page: { type: "integer", default: 1 },
            pageSize: { type: "integer", default: 10 },
          },
        },
      },
      onRequest: authenticate,
    },
    findTasksHandler,
  );

  fastify.get<{ Params: { id: string } }>(
    "/tasks/:id",
    {
      schema: {
        summary: "Find a task",
        tags: ["Tasks"],
        params: {
          type: "object",
          properties: {
            id: { type: "integer" },
          },
          required: ["id"],
        },
      },
      onRequest: authenticate,
    },
    findTaskHandler,
  );

  fastify.post(
    "/tasks",
    {
      schema: {
        summary: "Create a new task",
        tags: ["Tasks"],
        body: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            priority: {
              type: "string",
              enum: ["NONE", "LOW", "MEDIUM", "HIGH"],
              default: "NONE",
            },
            dueDate: { type: "string", format: "date-time" },
          },
          examples: [
            {
              title: "Sell paper",
              description: "Sell more paper than Jim",
              priority: "HIGH",
              dueDate: "2025-01-01T12:00:00.000Z",
            },
          ],
        },
      },
      onRequest: authenticate,
    },
    createTaskHandler,
  );

  fastify.post<{ Params: { id: string } }>(
    "/tasks/:id/share",
    {
      schema: {
        summary: "Share a task",
        tags: ["Tasks"],
        body: {
          type: "object",
          properties: {
            sharedWithId: { type: "number" },
          },
          required: ["sharedWithId"],
          examples: [{ sharedWithId: 2 }],
        },
      },
      onRequest: authenticate,
    },
    shareTaskHandler,
  );

  fastify.patch<{ Params: { id: string } }>(
    "/tasks/:id/prioritize",
    {
      schema: {
        summary: "Prioritize a task",
        tags: ["Tasks"],
        params: {
          type: "object",
          properties: {
            id: { type: "integer" },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            priority: {
              type: "string",
              enum: ["NONE", "LOW", "MEDIUM", "HIGH"],
            },
          },
          required: ["priority"],
          examples: [{ priority: "HIGH" }],
        },
      },
      onRequest: authenticate,
    },
    prioritizeTaskHandler,
  );

  fastify.patch<{ Params: { id: string } }>(
    "/tasks/:id/complete",
    {
      schema: {
        summary: "Mark a task as completed",
        tags: ["Tasks"],
        params: {
          type: "object",
          properties: {
            id: { type: "integer" },
          },
          required: ["id"],
        },
      },
      onRequest: authenticate,
    },
    completeTaskHandler,
  );
}
