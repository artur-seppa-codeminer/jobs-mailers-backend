import assert from "node:assert";
import type { QueryBuilder } from "objection";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { TaskFactory } from "../../_lib/testSupport/factories/taskFactory.js";
import { UserFactory } from "../../_lib/testSupport/factories/userFactory.js";
import {
  type IntegrationTest,
  setupIntegrationTest,
} from "../../_lib/testSupport/setupIntegrationTest.js";
import { Task } from "../../infrastructure/database/models/task.js";
import { User } from "../../infrastructure/database/models/user.js";
import { findTasks } from "./findTasks.js";

describe("FindTasks", () => {
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

  describe("when tasks that match the input exist", () => {
    it("returns tasks page", async () => {
      const currentUser = await UserFactory.create();

      // Tasks from the logged user that does not match the input.
      await TaskFactory.create({
        ownerId: currentUser.id,
        completedAt: new Date(),
        priority: 0,
      });
      await TaskFactory.create({
        ownerId: currentUser.id,
        completedAt: null,
        priority: 0,
      });

      // Not shared task from another user
      await TaskFactory.create({
        completedAt: null,
        priority: 3,
      });

      // Shared task from another user that does not match the input.
      await TaskFactory.create({
        completedAt: new Date(),
        priority: 0,
        collaborators: [currentUser],
      });

      const expectedTasks = [
        ...(await TaskFactory.createList(2, {
          ownerId: currentUser.id,
          completedAt: null,
          priority: 3,
        })),
        // Shared task from another user that matches the input.
        await TaskFactory.create({
          completedAt: null,
          priority: 3,
          collaborators: [currentUser],
        }),
      ];

      const input = {
        filter: {
          completed: false,
          priority: "HIGH" as const,
        },
        pagination: {
          page: 1,
          pageSize: 2,
        },
        currentUser,
      };

      const result = await findTasks(input);

      expect(result).toMatchObject({
        success: true,
        data: {
          results: expect.arrayContaining([expect.toBeOneOf(expectedTasks)]),
          total: 3,
        },
      });
      assert(result.success);
      expect(result.data?.results).toHaveLength(input.pagination.pageSize);
    });
  });

  describe("when tasks that match the input does not exist", () => {
    it("returns empty page", async () => {
      const currentUser = await UserFactory.create();

      // Tasks from the logged user that does not match the input.
      await TaskFactory.create({
        ownerId: currentUser.id,
        completedAt: new Date(),
        priority: 0,
      });
      await TaskFactory.create({
        ownerId: currentUser.id,
        completedAt: null,
        priority: 0,
      });

      // Not shared task from another user
      await TaskFactory.create({
        completedAt: null,
        priority: 3,
      });

      // Shared task from another user that does not match the input.
      await TaskFactory.create({
        completedAt: new Date(),
        priority: 0,
        collaborators: [currentUser],
      });

      const input = {
        filter: {
          completed: false,
          priority: "HIGH" as const,
        },
        pagination: {
          page: 1,
          pageSize: 2,
        },
        currentUser,
      };

      const result = await findTasks(input);

      expect(result).toMatchObject({
        success: true,
        data: {
          results: [],
          total: 0,
        },
      });
    });
  });

  describe("when a database error occurs", () => {
    it("returns a database error failure", async () => {
      vi.spyOn(Task, "query").mockReturnValue({
        withGraphFetched: vi.fn().mockReturnValue({
          withGraphFetched: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              page: vi.fn().mockRejectedValue(new Error("Database error")),
            }),
          }),
        }),
      } as unknown as QueryBuilder<Task>);

      const currentUser = User.fromJson(UserFactory.build());

      const input = {
        filter: {
          completed: false,
          priority: "HIGH" as const,
        },
        pagination: {
          page: 1,
          pageSize: 2,
        },
        currentUser,
      };

      const result = await findTasks(input);

      expect(result).toMatchObject({
        success: false,
        error: { code: "DATABASE_ERROR", message: "Database error" },
      });
    });
  });
});
