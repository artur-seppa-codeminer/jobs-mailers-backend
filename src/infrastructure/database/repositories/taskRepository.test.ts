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
import { TaskFactory } from "../../../_lib/testSupport/factories/taskFactory.js";
import { UserFactory } from "../../../_lib/testSupport/factories/userFactory.js";
import {
  type IntegrationTest,
  setupIntegrationTest,
} from "../../../_lib/testSupport/setupIntegrationTest.js";
import { Task } from "../models/task.js";
import { TaskRepository } from "./taskRepository.js";

describe("TaskRepository", () => {
  let integrationTest: IntegrationTest;

  beforeAll(async () => {
    integrationTest = await setupIntegrationTest();
  });

  beforeEach(async () => {
    vi.restoreAllMocks();
    await integrationTest.cleanDatabase();
  });

  afterAll(async () => {
    await integrationTest.tearDown();
  });

  describe("findById", () => {
    describe("when the task exists", () => {
      it("returns the task", async () => {
        const task = await TaskFactory.create();

        const result = await TaskRepository.findById(task.id);

        expect(result).toMatchObject({
          success: true,
          data: task,
        });
      });
    });

    describe("when the task does not exist", () => {
      it("returns undefined", async () => {
        const result = await TaskRepository.findById(100);

        expect(result).toMatchObject({
          success: true,
          data: undefined,
        });
      });
    });

    describe("when a database error occurs", () => {
      it("returns a database error failure", async () => {
        vi.spyOn(Task, "query").mockReturnValue({
          findById: vi.fn().mockReturnValue({
            withGraphFetched: vi.fn().mockReturnValue({
              withGraphFetched: vi
                .fn()
                .mockRejectedValue(new Error("Database error")),
            }),
          }),
        } as unknown as QueryBuilder<Task>);

        const result = await TaskRepository.findById(1);

        expect(result).toMatchObject({
          success: false,
          error: { code: "DATABASE_ERROR", message: "Database error" },
        });
      });
    });
  });

  describe("create", () => {
    it("creates the task", async () => {
      const owner = await UserFactory.create();
      const task = Task.fromJson(TaskFactory.build({ ownerId: owner.id }));

      const result = await TaskRepository.create(task);

      expect(result).toMatchObject({
        success: true,
        data: task,
      });
    });

    describe("when a database error occurs", () => {
      it("returns a database error failure", async () => {
        vi.spyOn(Task, "query").mockReturnValue({
          insertAndFetch: vi.fn().mockReturnValue({
            withGraphFetched: vi.fn().mockReturnValue({
              withGraphFetched: vi
                .fn()
                .mockRejectedValue(new Error("Database error")),
            }),
          }),
        } as unknown as QueryBuilder<Task>);

        const task = Task.fromJson(TaskFactory.build());

        const result = await TaskRepository.create(task);

        expect(result).toMatchObject({
          success: false,
          error: { code: "DATABASE_ERROR", message: "Database error" },
        });
      });
    });
  });

  describe("update", () => {
    it("updates the task", async () => {
      const task = await TaskFactory.create({
        completedAt: null,
      });
      const updatedProps = {
        completedAt: new Date(),
      };
      task.$set(updatedProps);

      const result = await TaskRepository.update(task);

      expect(result).toMatchObject({
        success: true,
        data: { ...task, ...updatedProps },
      });
    });

    describe("when there are not persisted collaborators", () => {
      it("adds the collaborators", async () => {
        const task = await TaskFactory.create();
        const collaborator = await UserFactory.create();
        task.collaborators = [collaborator];

        const result = await TaskRepository.update(task);

        expect(result).toMatchObject({
          success: true,
          data: task,
        });
      });
    });

    describe("when a database error occurs", () => {
      it("returns a database error failure", async () => {
        const task = await TaskFactory.create({
          completedAt: null,
        });
        const updatedProps = {
          completedAt: new Date(),
        };
        task.$set(updatedProps);

        vi.spyOn(Task, "query").mockReturnValue({
          patchAndFetchById: vi.fn().mockReturnValue({
            withGraphFetched: vi.fn().mockReturnValue({
              withGraphFetched: vi
                .fn()
                .mockRejectedValue(new Error("Database error")),
            }),
          }),
        } as unknown as QueryBuilder<Task>);

        const result = await TaskRepository.update(task);

        expect(result).toMatchObject({
          success: false,
          error: { code: "DATABASE_ERROR", message: "Database error" },
        });
      });
    });
  });
});
