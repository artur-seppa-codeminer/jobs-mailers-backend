import type { preHandlerAsyncHookHandler } from "fastify";
import "@fastify/jwt";
import {
  User,
  UserStatus,
} from "../../../infrastructure/database/models/user.js";

type Payload = { userId: number };

export const authenticate: preHandlerAsyncHookHandler = async (
  request,
  reply,
) => {
  try {
    const { userId } = await request.jwtVerify<Payload>();
    const user = await User.query().findOne({ id: userId });

    if (!user) {
      return reply.status(401).send("Invalid user");
    }

    if (user.status !== UserStatus.ACTIVE) {
      return reply.status(401).send("User is not active");
    }

    request.user = user;
  } catch (err) {
    reply.send(err);
  }
};

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: Payload;
    user: User;
  }
}
