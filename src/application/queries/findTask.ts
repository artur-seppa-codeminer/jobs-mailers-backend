import { Result } from "../../_lib/result.js";
import type { Task } from "../../infrastructure/database/models/task.js";
import type { User } from "../../infrastructure/database/models/user.js";
import { TaskRepository } from "../../infrastructure/database/repositories/taskRepository.js";

type FindTask = (input: {
  id: number;
  currentUser: User;
}) => Promise<Result<Task>>;

export const findTask: FindTask = async (input) => {
  const { id, currentUser } = input;

  const result = await TaskRepository.findById(id);
  if (!result.success) {
    return result;
  }

  const task = result.data;

  if (!task) {
    return Result.fail<Task>({ code: "NOT_FOUND", message: "Task not found" });
  }

  if (!task.canBeViewedBy(currentUser)) {
    return Result.fail<Task>({
      code: "FORBIDDEN",
      message: "User is not owner or collaborator of this task",
    });
  }

  return Result.succeed(task);
};
