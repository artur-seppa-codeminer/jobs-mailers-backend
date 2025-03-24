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
import { UserFactory } from "../../../_lib/testSupport/factories/userFactory.js";
import {
  type IntegrationTest,
  setupIntegrationTest,
} from "../../../_lib/testSupport/setupIntegrationTest.js";
import { User, UserRole, UserStatus } from "../models/user.js";
import { UserRepository } from "./userRepository.js";

describe("UserRepository", () => {
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
    describe("when the user exists", () => {
      it("returns the user", async () => {
        const user = await UserFactory.create();

        const result = await UserRepository.findById(user.id);

        expect(result).toMatchObject({
          success: true,
          data: user,
        });
      });
    });

    describe("when the user does not exist", () => {
      it("returns undefined", async () => {
        const result = await UserRepository.findById(100);

        expect(result).toMatchObject({
          success: true,
          data: undefined,
        });
      });
    });

    describe("when a database error occurs", () => {
      it("returns a database error failure", async () => {
        vi.spyOn(User, "query").mockReturnValue({
          findById: vi.fn().mockRejectedValue(new Error("Database error")),
        } as unknown as QueryBuilder<User>);

        const result = await UserRepository.findById(1);

        expect(result).toMatchObject({
          success: false,
          error: { code: "DATABASE_ERROR", message: "Database error" },
        });
      });
    });
  });

  describe("findByUsername", () => {
    describe("when the user exists", () => {
      it("returns the user", async () => {
        const user = await UserFactory.create();

        const result = await UserRepository.findByUsername(user.username);

        expect(result).toMatchObject({
          success: true,
          data: user,
        });
      });
    });

    describe("when the user does not exist", () => {
      it("returns undefined", async () => {
        const result = await UserRepository.findByUsername("unknown");

        expect(result).toMatchObject({
          success: true,
          data: undefined,
        });
      });
    });

    describe("when a database error occurs", () => {
      it("returns a database error failure", async () => {
        vi.spyOn(User, "query").mockReturnValue({
          findOne: vi.fn().mockRejectedValue(new Error("Database error")),
        } as unknown as QueryBuilder<User>);

        const result = await UserRepository.findByUsername("username");

        expect(result).toMatchObject({
          success: false,
          error: { code: "DATABASE_ERROR", message: "Database error" },
        });
      });
    });
  });

  describe("create", () => {
    it("creates the user", async () => {
      const user = User.fromJson(UserFactory.build());

      const result = await UserRepository.create(user);

      expect(result).toMatchObject({
        success: true,
        data: user,
      });
    });

    describe("when a database error occurs", () => {
      it("returns a database error failure", async () => {
        vi.spyOn(User, "query").mockReturnValue({
          insertAndFetch: vi
            .fn()
            .mockRejectedValue(new Error("Database error")),
        } as unknown as QueryBuilder<User>);

        const user = User.fromJson(UserFactory.build());

        const result = await UserRepository.create(user);

        expect(result).toMatchObject({
          success: false,
          error: { code: "DATABASE_ERROR", message: "Database error" },
        });
      });
    });
  });

  describe("update", () => {
    it("updates the user", async () => {
      const user = await UserFactory.create({
        role: UserRole.USER,
        status: UserStatus.INACTIVE,
      });
      const updatedProps = {
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      };
      user.$set(updatedProps);

      const result = await UserRepository.update(user);

      expect(result).toMatchObject({
        success: true,
        data: { ...user, ...updatedProps },
      });
    });

    describe("when a database error occurs", () => {
      it("returns a database error failure", async () => {
        const user = await UserFactory.create({
          role: UserRole.USER,
          status: UserStatus.INACTIVE,
        });
        const updatedProps = {
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
        };
        user.$set(updatedProps);

        vi.spyOn(User, "query").mockReturnValue({
          patchAndFetchById: vi
            .fn()
            .mockRejectedValue(new Error("Database error")),
        } as unknown as QueryBuilder<User>);

        const result = await UserRepository.update(user);

        expect(result).toMatchObject({
          success: false,
          error: { code: "DATABASE_ERROR", message: "Database error" },
        });
      });
    });
  });
});
