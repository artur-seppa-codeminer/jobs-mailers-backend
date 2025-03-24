import type { Page } from "objection";
import { Result } from "../../_lib/result.js";
import {
  Task,
  TaskPriority,
} from "../../infrastructure/database/models/task.js";
import type { User } from "../../infrastructure/database/models/user.js";

type FindTasks = (input: {
  filter: {
    completed: boolean | undefined;
    priority: "NONE" | "LOW" | "MEDIUM" | "HIGH" | undefined;
  };
  pagination: {
    page: number;
    pageSize: number;
  };
  currentUser: User;
}) => Promise<Result<{ results: Task[]; total: number }>>;

export const findTasks: FindTasks = async (input) => {
  const {
    filter: { completed, priority },
    pagination: { page, pageSize },
    currentUser,
  } = input;

  try {
    const tasksPage = await Task.query()
      .withGraphFetched("owner")
      .withGraphFetched("collaborators")
      .where((builder) => {
        builder.where(function () {
          this.where("ownerId", currentUser.id).orWhereExists(
            Task.relatedQuery("collaborators").where(
              "sharedWithId",
              currentUser.id,
            ),
          );
        });

        if (completed !== undefined) {
          builder.andWhere(function () {
            if (completed) {
              this.whereNotNull("completedAt");
            } else {
              this.whereNull("completedAt");
            }
          });
        }

        if (priority) {
          builder.andWhere("priority", TaskPriority[priority]);
        }
      })
      .page(page - 1, pageSize);

    return Result.succeed(tasksPage);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database error";

    return Result.fail<Page<Task>>({ code: "DATABASE_ERROR", message });
  }
};
