import { Result } from "../../_lib/result.js";
import {
  type Task,
  TaskPriority,
} from "../../infrastructure/database/models/task.js";
import type { User } from "../../infrastructure/database/models/user.js";
import { TaskRepository } from "../../infrastructure/database/repositories/taskRepository.js";

type PrioritizeTask = (input: {
  id: number;
  priority: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  currentUser: User;
}) => Promise<Result<Task>>;

export const prioritizeTask: PrioritizeTask = async (input) => {
  const { id, currentUser } = input;

  const findResult = await TaskRepository.findById(id);

  if (!findResult.success) {
    return findResult;
  }

  const task = findResult.data;

  if (!task) {
    return Result.fail({ code: "NOT_FOUND", message: "Task not found" });
  }

  if (!task.canBePrioritizedBy(currentUser)) {
    return Result.fail({
      code: "FORBIDDEN",
      message: "User is not owner or collaborator of this task",
    });
  }

  const prioritizeResult = task.prioritize(TaskPriority[input.priority]);

  if (!prioritizeResult.success) {
    return prioritizeResult;
  }

  const prioritizedTask = prioritizeResult.data;

  return await TaskRepository.update(prioritizedTask);
};
