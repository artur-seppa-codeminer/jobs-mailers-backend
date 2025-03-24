import { Result } from "../../../_lib/result.js";
import { User } from "../models/user.js";

export const UserRepository = {
  async findById(id: number) {
    try {
      const user = await User.query().findById(id);

      return Result.succeed(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      return Result.fail<User>({ code: "DATABASE_ERROR", message });
    }
  },

  async findByUsername(username: string) {
    try {
      const user = await User.query().findOne({ username });

      return Result.succeed(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";
      return Result.fail<User>({ code: "DATABASE_ERROR", message });
    }
  },

  async create(user: User) {
    try {
      const createdUser = await User.query().insertAndFetch(user);

      return Result.succeed(createdUser);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      return Result.fail<User>({ code: "DATABASE_ERROR", message });
    }
  },

  async update(user: User) {
    try {
      const updatedUser = await User.query().patchAndFetchById(user.id, user);

      return Result.succeed(updatedUser);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      return Result.fail<User>({ code: "DATABASE_ERROR", message });
    }
  },
};
