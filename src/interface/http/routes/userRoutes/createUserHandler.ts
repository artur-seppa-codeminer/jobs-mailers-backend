import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { createUser } from "../../../../application/useCases/createUser.js";
import { UserSerializer } from "../../serializers/userSerializer.js";

export async function createUserHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parseResult = CreateUserInput.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Invalid input",
      details: parseResult.error.issues,
    });
  }

  const { username, password } = parseResult.data;

  const result = await createUser({ username, password });

  if (!result.success) {
    if (result.error.code === "INVALID") {
      return reply.status(422).send({ error: result.error.message });
    }

    return reply.status(500).send({ error: result.error.message });
  }

  const createdUser = result.data;

  const serializedUser = UserSerializer.serialize(createdUser);

  return reply.status(201).send(serializedUser);
}

const CreateUserInput = z.object({
  username: z.string().nonempty(),
  password: z.string().nonempty(),
});
