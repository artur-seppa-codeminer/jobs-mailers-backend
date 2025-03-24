import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { TaskFactory } from "../../_lib/testSupport/factories/taskFactory.js";
import { UserFactory } from "../../_lib/testSupport/factories/userFactory.js";
import {
  type IntegrationTest,
  setupIntegrationTest,
} from "../../_lib/testSupport/setupIntegrationTest.js";
import { shareTask } from "./shareTask.js";

describe("ShareTask", () => {
  let integrationTest: IntegrationTest;

  beforeAll(async () => {
    integrationTest = await setupIntegrationTest();
  });

  beforeEach(async () => {
    await integrationTest.cleanDatabase();
  });

  afterAll(async () => {
    await integrationTest.tearDown();
  });

  describe("when the task exists", () => {
    describe("and belongs to the current user", () => {
      it("shares the task", async () => {
        const currentUser = await UserFactory.create();
        const task = await TaskFactory.create({
          completedAt: null,
          ownerId: currentUser.id,
        });
        const collaborator = await UserFactory.create();

        const input = {
          id: task.id,
          sharedWithId: collaborator.id,
          currentUser,
        };

        const result = await shareTask(input);

        expect(result).toMatchObject({
          success: true,
          data: {
            ...task,
            updatedAt: expect.any(Date),
            collaborators: [collaborator],
          },
        });
      });
    });

    describe("and is shared to the current user", () => {
      it("shares task", async () => {
        const currentUser = await UserFactory.create();
        const task = await TaskFactory.create({
          completedAt: null,
          collaborators: [currentUser],
        });
        const collaborator = await UserFactory.create();

        const input = {
          id: task.id,
          sharedWithId: collaborator.id,
          currentUser,
        };

        const result = await shareTask(input);

        expect(result).toMatchObject({
          success: true,
          data: {
            ...task,
            updatedAt: expect.any(Date),
            collaborators: [currentUser, collaborator],
          },
        });
      });
    });

    describe("and is already shared to the user", () => {
      it("returns invalid failure", async () => {
        const currentUser = await UserFactory.create();
        const collaborator = await UserFactory.create();
        const task = await TaskFactory.create({
          priority: 0,
          ownerId: currentUser.id,
          collaborators: [collaborator],
        });

        const input = {
          id: task.id,
          sharedWithId: collaborator.id,
          currentUser,
        };

        const result = await shareTask(input);

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "INVALID",
            message: "Task already shared with this user",
          },
        });
      });
    });

    describe("and is trying to share with the owner", () => {
      it("returns invalid failure", async () => {
        const currentUser = await UserFactory.create();
        const task = await TaskFactory.create({
          priority: 0,
          ownerId: currentUser.id,
        });

        const input = {
          id: task.id,
          sharedWithId: currentUser.id,
          currentUser,
        };

        const result = await shareTask(input);
        expect(result).toMatchObject({
          success: false,
          error: {
            code: "INVALID",
            message: "Task cannot be shared with owner",
          },
        });
      });
    });

    describe("and is trying to share with a user that does not exist", () => {
      it("returns invalid failure", async () => {
        const currentUser = await UserFactory.create();
        const task = await TaskFactory.create({
          priority: 0,
          ownerId: currentUser.id,
        });

        const input = { id: task.id, sharedWithId: 100, currentUser };

        const result = await shareTask(input);

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "INVALID",
            message: "User to be shared with not found",
          },
        });
      });
    });

    describe("and task is already completed", () => {
      it("returns invalid failure", async () => {
        const currentUser = await UserFactory.create();
        const task = await TaskFactory.create({
          completedAt: new Date(),
          ownerId: currentUser.id,
        });
        const collaborator = await UserFactory.create();

        const input = {
          id: task.id,
          sharedWithId: collaborator.id,
          currentUser,
        };

        const result = await shareTask(input);

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "INVALID",
            message: "Task is already completed",
          },
        });
      });
    });

    describe("and task is already shared with 5 users", () => {
      it("returns invalid failure", async () => {
        const currentUser = await UserFactory.create();
        const task = await TaskFactory.create({
          priority: 0,
          ownerId: currentUser.id,
          collaborators: await UserFactory.createList(5),
        });
        const collaborator = await UserFactory.create();

        const input = {
          id: task.id,
          sharedWithId: collaborator.id,
          currentUser,
        };

        const result = await shareTask(input);

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "INVALID",
            message: "Task cannot be shared with more than 5 users",
          },
        });
      });
    });

    describe("and does not belong and it is not shared with the current user", () => {
      it("returns forbidden failure", async () => {
        const currentUser = await UserFactory.create();
        const task = await TaskFactory.create();

        const input = { id: task.id, sharedWithId: 1, currentUser };

        const result = await shareTask(input);

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "User is not owner or collaborator of this task",
          },
        });
      });
    });
  });

  describe("when the task does not exist", () => {
    it("returns not found", async () => {
      const currentUser = await UserFactory.create();
      const input = { id: 1, sharedWithId: 1, currentUser };

      const result = await shareTask(input);

      expect(result).toMatchObject({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Task not found",
        },
      });
    });
  });
});
