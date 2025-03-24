import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { findTasks } from "../../../../application/queries/findTasks.js";
import { TaskSerializer } from "../../serializers/taskSerializer.js";

export async function findTasksHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parseResult = FindTasksInput.safeParse(request.query);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Invalid input",
      details: parseResult.error.issues,
    });
  }

  const { completed, priority, page, pageSize } = parseResult.data;

  const result = await findTasks({
    filter: { completed, priority },
    pagination: { page, pageSize },
    currentUser: request.user,
  });

  if (!result.success) {
    return reply.status(500).send({ error: "Failed to find tasks" });
  }

  const tasksPage = result.data;

  const serializedTasks = TaskSerializer.serializeList(tasksPage.results);

  return reply.send({ ...tasksPage, results: serializedTasks });
}

const FindTasksInput = z.object({
  completed: z.boolean().optional(),
  priority: z.enum(["NONE", "LOW", "MEDIUM", "HIGH"]).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
});
