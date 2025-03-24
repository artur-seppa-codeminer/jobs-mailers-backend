import type { FastifyReply, FastifyRequest } from "fastify";
import { promoteUser } from "../../../../application/useCases/promoteUser.js";
import { UserSerializer } from "../../serializers/userSerializer.js";

export async function promoteUserHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  const result = await promoteUser({
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

  const promotedUser = result.data;

  const serializedUser = UserSerializer.serialize(promotedUser);

  return reply.status(200).send(serializedUser);
}
