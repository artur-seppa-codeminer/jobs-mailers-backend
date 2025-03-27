import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { TaskFactory } from "../../_lib/testSupport/factories/taskFactory.js";
import {
    type IntegrationTest,
    setupIntegrationTest,
} from "../../_lib/testSupport/setupIntegrationTest.js";
import { completeTask } from "./completeTask.js";
import { updateStatusTask } from "./updateTask.js";

describe("UpdateStatusTask", () => {
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

    describe("when the task is valid to be marked", () => {
        it("return the number of tasks marked as done", async () => {
            const task = await TaskFactory.create({
                dueDate: new Date(),
                completedAt: null,
            });

            await completeTask({
                id: task.id,
                currentUser: task.owner,
            });

            const result = await updateStatusTask({ status: 'DONE' })

            expect(result).toMatchObject({
                success: true,
                data: 1
            });
        });

        it("return the number of tasks marked as late", async () => {
            const task = await TaskFactory.create({
                dueDate: new Date("2025-03-25T17:43:19.861Z"),
                createdAt: new Date("2025-03-27T17:43:19.861Z"),
                updatedAt: new Date("2025-03-27T17:43:32.073Z"),
                completedAt: null,
            });

            const result = await updateStatusTask({ status: 'LATE' })

            expect(result).toMatchObject({
                success: true,
                data: 1
            });
        });
    });

    describe("when the input is invalid", () => {
        it("return error of status invalid", async () => {
            const result = await updateStatusTask({ status: 'teste' })

            expect(result).toMatchObject({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'invalid status'
                }
            });
        });
    });

    describe("when the not exists tasks to be updated", () => {
        it("return error of tasks not found for status DONE", async () => {
            const result = await updateStatusTask({ status: 'DONE' })

            expect(result).toMatchObject({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'No tasks found to update'
                }
            });
        });

        it("return error of tasks not found for status LATE", async () => {
            const result = await updateStatusTask({ status: 'LATE' })

            expect(result).toMatchObject({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'No tasks found to update'
                }
            });
        });
    });
});
