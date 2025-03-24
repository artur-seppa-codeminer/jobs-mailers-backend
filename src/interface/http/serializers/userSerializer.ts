import type { User } from "../../../infrastructure/database/models/user.js";

export const UserSerializer = {
  serialize(user: User) {
    return {
      id: user.id,
      role: user.role,
      status: user.status,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
  serializeList(users: User[]) {
    return users.map(this.serialize);
  },
};
