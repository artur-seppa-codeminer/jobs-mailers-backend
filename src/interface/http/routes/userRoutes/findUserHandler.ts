import type { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../../../../infrastructure/database/models/user.js";
import { UserSerializer } from "../../serializers/userSerializer.js";

export async function findUserHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  try {
    const user = await User.query().findById(id);

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    const serializedUser = UserSerializer.serialize(user);

    return reply.send(serializedUser);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to find user" });
  }
}
