import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { TaskFactory } from "../../_lib/testSupport/factories/taskFactory.js";
import { UserFactory } from "../../_lib/testSupport/factories/userFactory.js";
import {
  type IntegrationTest,
  setupIntegrationTest,
} from "../../_lib/testSupport/setupIntegrationTest.js";
import { prioritizeTask } from "./prioritizeTask.js";

describe("PATCH /tasks/:id/prioritize", () => {
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
      it("prioritizes the task", async () => {
        const currentUser = await UserFactory.create();
        const task = await TaskFactory.create({
          priority: 0,
          ownerId: currentUser.id,
          dueDate: new Date(),
        });

        const input = {
          id: task.id,
          priority: "MEDIUM" as const,
          currentUser,
        };

        const result = await prioritizeTask(input);

        expect(result).toMatchObject({
          success: true,
          data: {
            ...task,
            priority: 2,
            updatedAt: expect.any(Date),
          },
        });
      });
    });

    describe("and is shared to the current user", () => {
      it("prioritizes task", async () => {
        const currentUser = await UserFactory.create();
        const task = await TaskFactory.create({
          priority: 0,
          collaborators: [currentUser],
          dueDate: new Date(),
        });

        const input = {
          id: task.id,
          priority: "MEDIUM" as const,
          currentUser,
        };

        const result = await prioritizeTask(input);

        expect(result).toMatchObject({
          success: true,
          data: {
            ...task,
            priority: 2,
            updatedAt: expect.any(Date),
          },
        });
      });
    });

    describe("and is already completed", () => {
      it("returns invalid failure", async () => {
        const currentUser = await UserFactory.create();
        const task = await TaskFactory.create({
          priority: 0,
          ownerId: currentUser.id,
          dueDate: new Date(),
          completedAt: new Date(),
        });

        const input = {
          id: task.id,
          priority: "MEDIUM" as const,
          currentUser,
        };

        const result = await prioritizeTask(input);

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "INVALID",
            message: "Task is already completed",
          },
        });
      });
    });

    describe("and dueDate is soon and is lowering the priority", () => {
      it("returns invalid failure", async () => {
        const currentUser = await UserFactory.create();
        const task = await TaskFactory.create({
          priority: 3,
          ownerId: currentUser.id,
          dueDate: faker.date.soon(),
        });

        const input = {
          id: task.id,
          priority: "MEDIUM" as const,
          currentUser,
        };

        const result = await prioritizeTask(input);

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "INVALID",
            message: "Cannot lower priority if due within 24 hours",
          },
        });
      });
    });

    describe("and does not belong and it is not shared with the current user", () => {
      it("returns forbidden failure", async () => {
        const currentUser = await UserFactory.create();
        const task = await TaskFactory.create();
        const input = {
          id: task.id,
          priority: "MEDIUM" as const,
          currentUser,
        };

        const result = await prioritizeTask(input);

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
    it("returns not found failure", async () => {
      const currentUser = await UserFactory.create();

      const input = {
        id: 1,
        priority: "MEDIUM" as const,
        currentUser,
      };

      const result = await prioritizeTask(input);

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
