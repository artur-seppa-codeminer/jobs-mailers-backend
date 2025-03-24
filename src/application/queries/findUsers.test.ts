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
import { UserFactory } from "../../_lib/testSupport/factories/userFactory.js";
import {
  type IntegrationTest,
  setupIntegrationTest,
} from "../../_lib/testSupport/setupIntegrationTest.js";
import {
  User,
  UserRole,
  UserStatus,
} from "../../infrastructure/database/models/user.js";
import { findUsers } from "./findUsers.js";

describe("FindUsers", () => {
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

  describe("when users that match the input exist", () => {
    it("returns users page", async () => {
      await UserFactory.create({
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      });
      await UserFactory.create({
        role: UserRole.ADMIN,
        status: UserStatus.INACTIVE,
      });
      await UserFactory.create({
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      });
      const expectedUsers = await UserFactory.createList(3, {
        role: UserRole.USER,
        status: UserStatus.INACTIVE,
      });

      const input = {
        filter: {
          role: UserRole.USER,
          status: UserStatus.INACTIVE,
        },
        pagination: {
          page: 1,
          pageSize: 2,
        },
      };

      const result = await findUsers(input);

      expect(result).toMatchObject({
        success: true,
        data: {
          results: expect.arrayContaining([expect.toBeOneOf(expectedUsers)]),
          total: 3,
        },
      });
    });
  });

  describe("when users that match the input does not exist", () => {
    it("returns empty page", async () => {
      await UserFactory.create({
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      });
      await UserFactory.create({
        role: UserRole.ADMIN,
        status: UserStatus.INACTIVE,
      });
      await UserFactory.create({
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      });

      const input = {
        filter: {
          role: UserRole.USER,
          status: UserStatus.INACTIVE,
        },
        pagination: {
          page: 1,
          pageSize: 2,
        },
      };

      const result = await findUsers(input);

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
      vi.spyOn(User, "query").mockReturnValue({
        where: vi.fn().mockReturnValue({
          page: vi.fn().mockRejectedValue(new Error("Database error")),
        }),
      } as unknown as QueryBuilder<User>);

      const input = {
        filter: {
          role: UserRole.USER,
          status: UserStatus.INACTIVE,
        },
        pagination: {
          page: 1,
          pageSize: 2,
        },
      };

      const result = await findUsers(input);

      expect(result).toMatchObject({
        success: false,
        error: { code: "DATABASE_ERROR", message: "Database error" },
      });
    });
  });
});
