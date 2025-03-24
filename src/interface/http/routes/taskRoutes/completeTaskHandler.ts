import type { FastifyReply, FastifyRequest } from "fastify";
import { completeTask } from "../../../../application/useCases/completeTask.js";
import { TaskSerializer } from "../../serializers/taskSerializer.js";

export async function completeTaskHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const result = await completeTask({
    id: Number(id),
    currentUser: request.user,
  });

  if (!result.success) {
    if (result.error.code === "FORBIDDEN") {
      return reply.status(403).send({ error: result.error.message });
    }

    if (result.error.code === "NOT_FOUND") {
      return reply.status(404).send({ error: result.error.message });
    }

    if (result.error.code === "INVALID") {
      return reply.status(422).send({ error: result.error.message });
    }

    return reply.status(500).send({ error: result.error.message });
  }

  const completedTask = result.data;

  const serializedTask = TaskSerializer.serialize(completedTask);

  return reply.status(200).send(serializedTask);
}
