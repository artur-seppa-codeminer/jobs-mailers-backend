import type { Page } from "objection";
import { Result } from "../../_lib/result.js";
import { User } from "../../infrastructure/database/models/user.js";

type FindUsers = (input: {
  filter: {
    role: string | undefined;
    status: string | undefined;
  };
  pagination: {
    page: number;
    pageSize: number;
  };
}) => Promise<Result<{ results: User[]; total: number }>>;

export const findUsers: FindUsers = async (input) => {
  const {
    filter: { role, status },
    pagination: { page, pageSize },
  } = input;

  try {
    const usersPage = await User.query()
      .where((builder) => {
        if (role) {
          builder.where({ role });
        }

        if (status) {
          builder.where({ status });
        }
      })
      .page(page - 1, pageSize);

    return Result.succeed(usersPage);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database error";

    return Result.fail<Page<User>>({ code: "DATABASE_ERROR", message });
  }
};
