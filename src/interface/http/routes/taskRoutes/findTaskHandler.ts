import type { FastifyReply, FastifyRequest } from "fastify";
import { findTask } from "../../../../application/queries/findTask.js";
import { TaskSerializer } from "../../serializers/taskSerializer.js";

export async function findTaskHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const result = await findTask({ id: Number(id), currentUser: request.user });

  if (!result.success) {
    if (result.error.code === "FORBIDDEN") {
      return reply
        .status(403)
        .send({ error: "User is not owner or collaborator of this task" });
    }

    if (result.error.code === "NOT_FOUND") {
      return reply.status(404).send({ error: "Task not found" });
    }

    return reply.status(500).send({ error: "Failed to find task" });
  }

  const task = result.data;

  const serializedTask = TaskSerializer.serialize(task);

  return reply.send(serializedTask);
}
