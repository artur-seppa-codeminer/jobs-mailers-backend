import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { findUsers } from "../../../../application/queries/findUsers.js";
import { UserSerializer } from "../../serializers/userSerializer.js";

export async function findUsersHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parseResult = FindUsersInput.safeParse(request.query);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Invalid input",
      details: parseResult.error.issues,
    });
  }

  const { role, status, page, pageSize } = parseResult.data;

  const result = await findUsers({
    filter: { role, status },
    pagination: { page, pageSize },
  });
  if (!result.success) {
    return reply.status(500).send({ error: result.error.message });
  }

  const usersPage = result.data;

  const serializedUsers = UserSerializer.serializeList(usersPage.results);

  return reply.send({ ...usersPage, results: serializedUsers });
}

const FindUsersInput = z.object({
  role: z.enum(["ADMIN", "USER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
});
