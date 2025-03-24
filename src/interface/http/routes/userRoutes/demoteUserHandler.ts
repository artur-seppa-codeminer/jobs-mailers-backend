import type { FastifyReply, FastifyRequest } from "fastify";
import {
  User,
  UserRole,
} from "../../../../infrastructure/database/models/user.js";
import { UserSerializer } from "../../serializers/userSerializer.js";

export async function demoteUserHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  try {
    if (request.user.role !== UserRole.ADMIN) {
      return reply.status(403).send({ error: "Only admins can demote users" });
    }

    const user = await User.query().findById(id);

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    if (user.id === request.user.id) {
      return reply
        .status(403)
        .send({ error: "Cannot demote your own account" });
    }

    if (user.role === UserRole.USER) {
      return reply
        .status(422)
        .send({ error: 'User already has the "USER" role' });
    }

    user.role = UserRole.USER;

    const demotedUser = await User.query().patchAndFetchById(id, user);

    const serializedUser = UserSerializer.serialize(demotedUser);

    return reply.status(200).send(serializedUser);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to demote user" });
  }
}
