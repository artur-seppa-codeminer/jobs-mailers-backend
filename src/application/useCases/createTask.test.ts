import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { UserFactory } from "../../_lib/testSupport/factories/userFactory.js";
import {
  type IntegrationTest,
  setupIntegrationTest,
} from "../../_lib/testSupport/setupIntegrationTest.js";
import { UserStatus } from "../../infrastructure/database/models/user.js";
import { createTask } from "./createTask.js";

describe("CreateTask", () => {
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

  it("creates a new task", async () => {
    const owner = await UserFactory.create({
      status: UserStatus.ACTIVE,
    });

    const input = {
      ownerId: owner.id,
      title: faker.lorem.words(),
      description: faker.lorem.sentence(),
      priority: "HIGH" as const,
      dueDate: faker.date.future(),
    };

    const result = await createTask(input);

    expect(result).toMatchObject({
      success: true,
      data: {
        id: expect.any(Number),
        title: input.title,
        description: input.description,
        priority: 3,
        dueDate: expect.any(Date),
        completedAt: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        owner,
        collaborators: [],
      },
    });
  });
});
