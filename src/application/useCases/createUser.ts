import { Result } from "../../_lib/result.js";
import {
  User,
  UserRole,
  UserStatus,
} from "../../infrastructure/database/models/user.js";
import { UserRepository } from "../../infrastructure/database/repositories/userRepository.js";

type CreateUser = (input: {
  username: string;
  password: string;
}) => Promise<Result<User>>;

export const createUser: CreateUser = async (input) => {
  const { username, password } = input;

  const findResult = await UserRepository.findByUsername(username);
  if (!findResult.success) {
    return findResult;
  }

  const existingUser = findResult.data;

  if (existingUser) {
    return Result.fail({ code: "INVALID", message: "Username already exists" });
  }

  const user = User.fromJson({
    role: UserRole.USER,
    status: UserStatus.INACTIVE,
    username,
    password,
  });

  return await UserRepository.create(user);
};
