import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prioritizeTask } from "../../../../application/useCases/prioritizeTask.js";
import { TaskSerializer } from "../../serializers/taskSerializer.js";

export async function prioritizeTaskHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const parseResult = PrioritizeTaskInput.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Invalid input",
      details: parseResult.error.issues,
    });
  }

  const { id } = request.params;
  const { priority } = parseResult.data;

  const result = await prioritizeTask({
    id: Number(id),
    priority,
    currentUser: request.user,
  });

  if (!result.success) {
    if (result.error.code === "FORBIDDEN") {
      return reply
        .status(403)
        .send({ error: "User is not owner or collaborator of this task" });
    }

    if (result.error.code === "NOT_FOUND") {
      return reply.status(404).send({ error: "Task not found" });
    }

    if (result.error.code === "INVALID") {
      return reply.status(422).send({ error: result.error.message });
    }

    return reply.status(500).send({ error: "Failed to prioritize task" });
  }

  const prioritizedTask = result.data;

  const serializedTask = TaskSerializer.serialize(prioritizedTask);

  return reply.status(200).send(serializedTask);
}

const PrioritizeTaskInput = z.object({
  priority: z.enum(["NONE", "LOW", "MEDIUM", "HIGH"]),
});
