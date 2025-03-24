import {
  type Task,
  TaskPriority,
} from "../../../infrastructure/database/models/task.js";
import { UserSerializer } from "./userSerializer.js";

export const TaskSerializer = {
  serialize(task: Task) {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: Object.entries(TaskPriority).find(
        ([_key, value]) => value === task.priority,
      )?.[0],
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      owner: UserSerializer.serialize(task.owner),
      collaborators: UserSerializer.serializeList(task.collaborators),
    };
  },
  serializeList(tasks: Task[]) {
    return tasks.map(this.serialize);
  },
};
