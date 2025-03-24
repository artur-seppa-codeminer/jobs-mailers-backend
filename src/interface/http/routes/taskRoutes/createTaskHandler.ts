import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { createTask } from "../../../../application/useCases/createTask.js";
import { TaskSerializer } from "../../serializers/taskSerializer.js";

export async function createTaskHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parseResult = CreateTaskInput.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Invalid input",
      details: parseResult.error.issues,
    });
  }

  const { title, description, priority, dueDate } = parseResult.data;

  const result = await createTask({
    ownerId: request.user.id,
    title: title,
    description: description,
    priority: priority,
    dueDate: dueDate ? new Date(dueDate) : undefined,
  });

  if (!result.success) {
    return reply.status(500).send({ error: result.error.message });
  }

  const createdTask = result.data;

  const serializedTask = TaskSerializer.serialize(createdTask);

  return reply.status(201).send(serializedTask);
}

const CreateTaskInput = z.object({
  title: z.string().nonempty(),
  description: z.string().optional(),
  priority: z.enum(["NONE", "LOW", "MEDIUM", "HIGH"]).default("NONE"),
  dueDate: z.string().datetime().optional(),
});
