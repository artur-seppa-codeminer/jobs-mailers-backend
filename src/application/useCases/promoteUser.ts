import { Result } from "../../_lib/result.js";
import {
  type User,
  UserRole,
} from "../../infrastructure/database/models/user.js";
import { UserRepository } from "../../infrastructure/database/repositories/userRepository.js";

type PromoteUser = (input: {
  id: number;
  currentUser: User;
}) => Promise<Result<User>>;

export const promoteUser: PromoteUser = async (input) => {
  const { id, currentUser } = input;

  if (currentUser.role !== UserRole.ADMIN) {
    return Result.fail({
      code: "FORBIDDEN",
      message: "Only admins can promote users",
    });
  }

  const findResult = await UserRepository.findById(id);

  if (!findResult.success) {
    return findResult;
  }

  const user = findResult.data;

  if (!user) {
    return Result.fail({ code: "NOT_FOUND", message: "User not found" });
  }

  if (user.isTheSameAs(currentUser)) {
    return Result.fail({
      code: "FORBIDDEN",
      message: "Cannot promote your own account",
    });
  }

  const promoteResult = user.promote();
  if (!promoteResult.success) {
    return promoteResult;
  }

  const promotedUser = promoteResult.data;

  return await UserRepository.update(promotedUser);
};
