import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { TaskFactory } from "../../_lib/testSupport/factories/taskFactory.js";
import { UserFactory } from "../../_lib/testSupport/factories/userFactory.js";
import {
  type IntegrationTest,
  setupIntegrationTest,
} from "../../_lib/testSupport/setupIntegrationTest.js";
import { UserStatus } from "../../infrastructure/database/models/user.js";
import { completeTask } from "./completeTask.js";

describe("CompleteTask", () => {
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
      it("completes the task", async () => {
        const task = await TaskFactory.create({
          dueDate: new Date(),
          completedAt: null,
        });

        const result = await completeTask({
          id: task.id,
          currentUser: task.owner,
        });

        expect(result).toMatchObject({
          success: true,
          data: {
            ...task,
            completedAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        });
      });
    });

    describe("and is shared to the current user", () => {
      it("completes task", async () => {
        const currentUser = await UserFactory.create({
          status: UserStatus.ACTIVE,
        });
        const task = await TaskFactory.create({
          dueDate: new Date(),
          completedAt: null,
          collaborators: [currentUser],
        });

        const result = await completeTask({ id: task.id, currentUser });

        expect(result).toMatchObject({
          success: true,
          data: {
            ...task,
            completedAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        });
      });
    });

    describe("and is already completed", () => {
      it("returns invalid failure", async () => {
        const task = await TaskFactory.create({
          dueDate: new Date(),
          completedAt: new Date(),
        });

        const result = await completeTask({
          id: task.id,
          currentUser: task.owner,
        });

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "INVALID",
            message: "Task is already completed",
          },
        });
      });
    });

    describe("and dueDate is in the future", () => {
      it("returns invalid failure", async () => {
        const task = await TaskFactory.create({
          dueDate: faker.date.future(),
          completedAt: null,
        });

        const result = await completeTask({
          id: task.id,
          currentUser: task.owner,
        });

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "INVALID",
            message: "Task cannot be completed before the due date",
          },
        });
      });
    });

    describe("and does not belong and it is not shared with the logged user", () => {
      it("returns forbidden failure", async () => {
        const currentUser = await UserFactory.create();
        const task = await TaskFactory.create();

        const result = await completeTask({
          id: task.id,
          currentUser,
        });

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

      const result = await completeTask({
        id: 1,
        currentUser,
      });

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
