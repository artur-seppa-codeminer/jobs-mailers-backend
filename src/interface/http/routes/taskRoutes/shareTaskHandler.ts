import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { shareTask } from "../../../../application/useCases/shareTask.js";
import { TaskSerializer } from "../../serializers/taskSerializer.js";

export async function shareTaskHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const parseResult = ShareTaskInput.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Invalid input",
        details: parseResult.error.issues,
      });
    }

    const { id } = request.params;
    const { sharedWithId } = parseResult.data;

    const result = await shareTask({
      id: Number(id),
      sharedWithId,
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

      return reply.status(500).send({ error: "Failed to share task" });
    }

    const task = result.data;

    const serializedTask = TaskSerializer.serialize(task);

    return reply.status(201).send(serializedTask);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to share task" });
  }
}

const ShareTaskInput = z.object({
  sharedWithId: z.number(),
});
