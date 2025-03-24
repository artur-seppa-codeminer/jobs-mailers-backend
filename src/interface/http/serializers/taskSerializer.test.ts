import { describe, expect, it } from "vitest";
import { TaskFactory } from "../../../_lib/testSupport/factories/taskFactory.js";
import { UserFactory } from "../../../_lib/testSupport/factories/userFactory.js";
import { Task } from "../../../infrastructure/database/models/task.js";
import type { User } from "../../../infrastructure/database/models/user.js";
import { TaskSerializer } from "./taskSerializer.js";

describe("TaskSerializer", () => {
  describe("serialize", () => {
    it("returns the serialized task", () => {
      const owner = UserFactory.build();
      const collaborators = UserFactory.buildList(2) as User[];
      const task = Task.fromJson(
        TaskFactory.build({ priority: 3, owner, collaborators }),
      );

      const result = TaskSerializer.serialize(task);

      expect(result).toMatchObject({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: "HIGH",
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        owner: {
          id: owner.id,
          role: owner.role,
          status: owner.status,
          username: owner.username,
          createdAt: owner.createdAt,
          updatedAt: owner.updatedAt,
        },
        collaborators: collaborators.map((collaborator) => ({
          id: collaborator.id,
          role: collaborator.role,
          status: collaborator.status,
          username: collaborator.username,
          createdAt: collaborator.createdAt,
          updatedAt: collaborator.updatedAt,
        })),
      });
    });
  });

  describe("serializeList", () => {
    it("returns the serialized list of tasks", () => {
      const owner = UserFactory.build();
      const collaborators = UserFactory.buildList(2) as User[];
      const tasks = TaskFactory.buildList(3, {
        priority: 3,
        owner,
        collaborators,
      }).map((taskProps) => Task.fromJson(taskProps));

      const result = TaskSerializer.serializeList(tasks);

      expect(result).toStrictEqual(
        tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: "HIGH",
          dueDate: task.dueDate,
          completedAt: task.completedAt,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          owner: {
            id: owner.id,
            role: owner.role,
            status: owner.status,
            username: owner.username,
            createdAt: owner.createdAt,
            updatedAt: owner.updatedAt,
          },
          collaborators: collaborators.map((collaborator) => ({
            id: collaborator.id,
            role: collaborator.role,
            status: collaborator.status,
            username: collaborator.username,
            createdAt: collaborator.createdAt,
            updatedAt: collaborator.updatedAt,
          })),
        })),
      );
    });
  });
});
