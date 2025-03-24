import type { FastifyInstance } from "fastify";
import { authenticate } from "../../hooks/authenticate.js";
import { activateUserHandler } from "./activateUserHandler.js";
import { createUserHandler } from "./createUserHandler.js";
import { deactivateUserHandler } from "./deactivateUserHandler.js";
import { demoteUserHandler } from "./demoteUserHandler.js";
import { findUserHandler } from "./findUserHandler.js";
import { findUsersHandler } from "./findUsersHandler.js";
import { makeLoginUserHandler } from "./loginUserHandler.js";
import { promoteUserHandler } from "./promoteUserHandler.js";

export function userRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/users",
    {
      schema: {
        summary: "Find users",
        tags: ["Users"],
        querystring: {
          type: "object",
          properties: {
            role: { type: "string", enum: ["ADMIN", "USER"] },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
            page: { type: "integer", default: 1 },
            pageSize: { type: "integer", default: 10 },
          },
        },
      },
    },
    findUsersHandler,
  );

  fastify.get(
    "/users/:id",
    {
      schema: {
        summary: "Find a user",
        tags: ["Users"],
        params: {
          type: "object",
          properties: {
            id: { type: "integer" },
          },
          required: ["id"],
        },
      },
    },
    findUserHandler,
  );

  fastify.post(
    "/users",
    {
      schema: {
        summary: "Create a new user",
        tags: ["Users"],
        body: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
          },
          examples: [{ username: "username", password: "password" }],
        },
      },
    },
    createUserHandler,
  );

  fastify.patch<{ Params: { id: string } }>(
    "/users/:id/promote",
    {
      schema: {
        summary: 'Promote a user to the "ADMIN" role',
        tags: ["Users"],
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
    promoteUserHandler,
  );

  fastify.patch<{ Params: { id: string } }>(
    "/users/:id/demote",
    {
      schema: {
        summary: 'Demote a user to the "USER" role',
        tags: ["Users"],
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
    demoteUserHandler,
  );

  fastify.patch<{ Params: { id: string } }>(
    "/users/:id/activate",
    {
      schema: {
        summary: "Activate a user",
        tags: ["Users"],
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
    activateUserHandler,
  );

  fastify.patch<{ Params: { id: string } }>(
    "/users/:id/deactivate",
    {
      schema: {
        summary: "Deactivate a user",
        tags: ["Users"],
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
    deactivateUserHandler,
  );

  fastify.post(
    "/login",
    {
      schema: {
        summary: "Login",
        tags: ["Users"],
        body: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
          },
          examples: [{ username: "michael", password: "dunder" }],
        },
      },
    },
    makeLoginUserHandler({ fastify }),
  );
}
