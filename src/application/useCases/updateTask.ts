import { Result } from "../../_lib/result.js";
import type { Task } from "../../infrastructure/database/models/task.js";
import { TaskRepository } from "../../infrastructure/database/repositories/taskRepository.js";

type UpdateStatusTask = (input: {
    status: string | null
}) => Promise<Result<number>>;

export const updateStatusTask: UpdateStatusTask = async (input) => {
    const { status } = input;
    let returnedTask;

    switch (status) {
        case 'LATE':
            returnedTask = await TaskRepository.findOpenLateTasks();
            break;

        case 'DONE':
            returnedTask = await TaskRepository.findCompletedTasksNotMarkedAsDone();
            break;

        default:
            return Result.fail({ code: "NOT_FOUND", message: `invalid status`  });
    }

    if (!returnedTask.success) {
        return returnedTask;
    }

    const tasks = returnedTask.data;

    if (!tasks || tasks.length === 0) {
        return Result.fail({
            code: "NOT_FOUND",
            message: "No tasks found to update"
        });
    }

    const taskIds = tasks.map(task => task.id);
    return await TaskRepository.updateTasksStatus(taskIds, status);
};
