import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  User,
  UserStatus,
} from "../../../../infrastructure/database/models/user.js";

type Dependencies = {
  fastify: FastifyInstance;
};

export function makeLoginUserHandler(dependencies: Dependencies) {
  const { fastify } = dependencies;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const parseResult = LoginInput.safeParse(request.body);

      if (!parseResult.success) {
        return reply.status(400).send({
          error: "Invalid input",
          details: parseResult.error.issues,
        });
      }

      const { username, password } = parseResult.data;

      const user = await User.authenticate({ username, password });

      if (!user) {
        return reply
          .status(401)
          .send({ error: "Invalid username or password" });
      }

      if (user.status !== UserStatus.ACTIVE) {
        return reply.status(401).send({ error: "User is not active" });
      }

      const token = fastify.jwt.sign(
        { userId: user.id },
        { algorithm: "HS256" },
      );

      return reply.send({ token });
    } catch (error) {
      return reply.status(500).send({ error: "Failed to login" });
    }
  };
}

const LoginInput = z.object({
  username: z.string().nonempty(),
  password: z.string().nonempty(),
});
