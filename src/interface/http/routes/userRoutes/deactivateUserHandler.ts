import type { FastifyReply, FastifyRequest } from "fastify";
import {
  User,
  UserRole,
  UserStatus,
} from "../../../../infrastructure/database/models/user.js";
import { UserSerializer } from "../../serializers/userSerializer.js";

export async function deactivateUserHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { id } = request.params;

  try {
    if (request.user.role !== UserRole.ADMIN) {
      return reply
        .status(403)
        .send({ error: "Only admins can deactivate users" });
    }

    const user = await User.query().findById(id);

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    if (user.id === request.user.id) {
      return reply
        .status(403)
        .send({ error: "Cannot deactivate your own account" });
    }

    if (user.status === UserStatus.INACTIVE) {
      return reply.status(422).send({ error: "User is already inactive" });
    }

    user.status = UserStatus.INACTIVE;

    const deactivatedUser = await User.query().patchAndFetchById(id, user);

    const serializedUser = UserSerializer.serialize(deactivatedUser);

    return reply.status(200).send(serializedUser);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to deactivate user" });
  }
}
