import type { Result } from "../../_lib/result.js";
import {
  Task,
  TaskPriority,
} from "../../infrastructure/database/models/task.js";
import { TaskRepository } from "../../infrastructure/database/repositories/taskRepository.js";

type CreateTask = (input: {
  ownerId: number;
  title: string;
  description: string | undefined;
  priority: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  dueDate: Date | undefined;
}) => Promise<Result<Task>>;

export const createTask: CreateTask = async (input) => {
  const { ownerId, title, description, priority, dueDate } = input;

  const task = Task.fromJson({
    ownerId,
    title,
    description: description || null,
    priority: TaskPriority[priority],
    dueDate: dueDate ? new Date(dueDate) : undefined,
  });

  return await TaskRepository.create(task);
};
