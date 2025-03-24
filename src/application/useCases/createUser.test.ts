import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { UserFactory } from "../../_lib/testSupport/factories/userFactory.js";
import {
  type IntegrationTest,
  setupIntegrationTest,
} from "../../_lib/testSupport/setupIntegrationTest.js";
import { createUser } from "./createUser.js";

describe("CreateUser", () => {
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

  describe("when the input is valid", () => {
    it("creates a new user", async () => {
      const input = {
        username: faker.internet.username(),
        password: faker.internet.password(),
      };

      const result = await createUser(input);

      expect(result).toMatchObject({
        success: true,
        data: {
          id: expect.any(Number),
          username: input.username,
          role: "USER",
          status: "INACTIVE",
          encryptedPassword: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe("when the username already exists", () => {
    it("returns invalid failure", async () => {
      const input = {
        username: faker.internet.username(),
        password: faker.internet.password(),
      };

      await UserFactory.create({ username: input.username });

      const result = await createUser(input);

      expect(result).toMatchObject({
        success: false,
        error: {
          code: "INVALID",
          message: "Username already exists",
        },
      });
    });
  });
});
