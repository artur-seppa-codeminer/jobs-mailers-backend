import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { TaskFactory } from "../../_lib/testSupport/factories/taskFactory.js";
import { UserFactory } from "../../_lib/testSupport/factories/userFactory.js";
import {
  type IntegrationTest,
  setupIntegrationTest,
} from "../../_lib/testSupport/setupIntegrationTest.js";
import { findTask } from "./findTask.js";

describe("FindTask", () => {
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
      it("returns the task", async () => {
        const task = await TaskFactory.create();

        const input = { id: task.id, currentUser: task.owner };

        const result = await findTask(input);

        expect(result).toMatchObject({
          success: true,
          data: task,
        });
      });
    });

    describe("and is shared to the current user", () => {
      it("returns the task", async () => {
        const currentUser = await UserFactory.create();
        const task = await TaskFactory.create({
          collaborators: [currentUser],
        });

        const input = { id: task.id, currentUser };

        const result = await findTask(input);

        expect(result).toMatchObject({
          success: true,
          data: task,
        });
      });
    });

    describe("and does not belong and it is not shared with the current user", () => {
      it("returns forbidden failure", async () => {
        const currentUser = await UserFactory.create();
        const task = await TaskFactory.create();

        const input = { id: task.id, currentUser };

        const result = await findTask(input);

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

      const input = { id: 1, currentUser };

      const result = await findTask(input);

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
