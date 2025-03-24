import { Result } from "../../../_lib/result.js";
import { Task } from "../models/task.js";
import { TaskShare } from "../models/taskShare.js";

export const TaskRepository = {
  async findById(id: number) {
    try {
      const task = await Task.query()
        .findById(id)
        .withGraphFetched("owner")
        .withGraphFetched("collaborators");

      return Result.succeed(task);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      return Result.fail<Task>({ code: "DATABASE_ERROR", message });
    }
  },

  async create(task: Task) {
    try {
      const createdTask = await Task.query()
        .insertAndFetch(task)
        .withGraphFetched("owner")
        .withGraphFetched("collaborators");

      return Result.succeed(createdTask);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      return Result.fail<Task>({ code: "DATABASE_ERROR", message });
    }
  },

  async update(task: Task) {
    try {
      const taskShares = await TaskShare.query().where("taskId", task.id);
      const collaboratorToAdd = task.collaborators.filter(
        (collaborator) =>
          !taskShares.some((share) => share.sharedWithId === collaborator.id),
      );

      const updatedTask = await Task.transaction(async (transaction) => {
        if (collaboratorToAdd.length) {
          await TaskShare.query(transaction).insert(
            collaboratorToAdd.map((collaborator) => ({
              taskId: task.id,
              sharedById: task.ownerId,
              sharedWithId: collaborator.id,
              sharedAt: new Date(),
            })),
          );
        }

        const updatedTask = await Task.query(transaction)
          .patchAndFetchById(task.id, task)
          .withGraphFetched("owner")
          .withGraphFetched("collaborators");

        return updatedTask;
      });

      return Result.succeed(updatedTask);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      return Result.fail<Task>({ code: "DATABASE_ERROR", message });
    }
  },
};
