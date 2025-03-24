import type { FastifyReply, FastifyRequest } from "fastify";
import {
  User,
  UserRole,
  UserStatus,
} from "../../../../infrastructure/database/models/user.js";
import { UserSerializer } from "../../serializers/userSerializer.js";

export async function activateUserHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  try {
    if (request.user.role !== UserRole.ADMIN) {
      return reply
        .status(403)
        .send({ error: "Only admins can activate users" });
    }

    const user = await User.query().findById(id);

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    if (user.id === request.user.id) {
      return reply
        .status(403)
        .send({ error: "Cannot activate your own account" });
    }

    if (user.status === UserStatus.ACTIVE) {
      return reply.status(422).send({ error: "User is already active" });
    }

    user.status = UserStatus.ACTIVE;

    const activatedUser = await User.query().patchAndFetchById(id, user);

    const serializedUser = UserSerializer.serialize(activatedUser);

    return reply.status(200).send(serializedUser);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to activate user" });
  }
}
