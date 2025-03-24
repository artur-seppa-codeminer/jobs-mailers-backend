import { Result } from "../../_lib/result.js";
import type { Task } from "../../infrastructure/database/models/task.js";
import type { User } from "../../infrastructure/database/models/user.js";
import { TaskRepository } from "../../infrastructure/database/repositories/taskRepository.js";

type CompleteTask = (input: {
  id: number;
  currentUser: User;
}) => Promise<Result<Task>>;

export const completeTask: CompleteTask = async (input) => {
  const { id, currentUser } = input;

  const findResult = await TaskRepository.findById(id);

  if (!findResult.success) {
    return findResult;
  }

  const task = findResult.data;

  if (!task) {
    return Result.fail({ code: "NOT_FOUND", message: "Task not found" });
  }

  if (!task.canBeCompletedBy(currentUser)) {
    return Result.fail({
      code: "FORBIDDEN",
      message: "User is not owner or collaborator of this task",
    });
  }

  const completeResult = task.complete();
  if (!completeResult.success) {
    return completeResult;
  }

  const completedTask = completeResult.data;

  return await TaskRepository.update(completedTask);
};
