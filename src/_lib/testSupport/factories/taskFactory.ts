import { faker } from "@faker-js/faker";
import { Factory } from "fishery";
import type { ModelObject } from "objection";
import { Task } from "../../../infrastructure/database/models/task.js";
import { TaskShare } from "../../../infrastructure/database/models/taskShare.js";
import { UserFactory } from "./userFactory.js";

const TaskFactory = Factory.define<ModelObject<Task>, never, Task>(
  ({ onCreate, sequence, params }) => {
    onCreate(async (task) => {
      if (!params.ownerId) {
        const owner = await UserFactory.create();
        task.ownerId = owner.id;
      }

      const createdTask = await Task.query()
        .insertAndFetch(task)
        .withGraphFetched("owner")
        .withGraphFetched("collaborators");

      if (params.collaborators) {
        await TaskShare.query().insert(
          collaborators.map((collaborator) => ({
            taskId: createdTask.id,
            sharedById: createdTask.ownerId,
            sharedWithId: collaborator.id,
            sharedAt: new Date(),
          })),
        );

        const taskWithCollaborators = await Task.query()
          .findById(createdTask.id)
          .withGraphFetched("owner")
          .withGraphFetched("collaborators");

        if (!taskWithCollaborators) {
          throw new Error("Failed to share task");
        }

        return taskWithCollaborators;
      }

      return createdTask;
    });

    const {
      ownerId = UserFactory.build().id,
      title = faker.lorem.words(),
      description = faker.lorem.sentence(),
      priority = faker.number.int({ min: 0, max: 3 }),
      dueDate = faker.date.future(),
      completedAt = null,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      owner = UserFactory.build() as any,
      collaborators = [],
    } = params;

    return {
      id: sequence,
      ownerId,
      title,
      description,
      priority,
      dueDate,
      completedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      owner,
      collaborators,
    };
  },
);

export { TaskFactory };
