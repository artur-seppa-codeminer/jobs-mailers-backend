import { Result } from "../../_lib/result.js";
import type { Task } from "../../infrastructure/database/models/task.js";
import type { User } from "../../infrastructure/database/models/user.js";
import { TaskRepository } from "../../infrastructure/database/repositories/taskRepository.js";
import { UserRepository } from "../../infrastructure/database/repositories/userRepository.js";

type CreateTask = (input: {
  id: number;
  sharedWithId: number;
  currentUser: User;
}) => Promise<Result<Task>>;

export const shareTask: CreateTask = async (input) => {
  const { id, sharedWithId, currentUser } = input;

  const findResult = await TaskRepository.findById(id);

  if (!findResult.success) {
    return findResult;
  }

  const task = findResult.data;

  if (!task) {
    return Result.fail({ code: "NOT_FOUND", message: "Task not found" });
  }

  if (!task.canBeSharedBy(currentUser)) {
    return Result.fail({
      code: "FORBIDDEN",
      message: "User is not owner or collaborator of this task",
    });
  }

  const findUserResult = await UserRepository.findById(sharedWithId);

  if (!findUserResult.success) {
    return findUserResult;
  }

  const user = findUserResult.data;

  if (!user) {
    return Result.fail({
      code: "INVALID",
      message: "User to be shared with not found",
    });
  }

  const shareResult = task.shareWith(user);

  if (!shareResult.success) {
    return shareResult;
  }

  const sharedTask = shareResult.data;

  return await TaskRepository.update(sharedTask);
};
