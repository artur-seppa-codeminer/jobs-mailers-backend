// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Result<T = any> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export const Result = {
  succeed<T>(data: T): Result<T> {
    return { success: true, data };
  },

  fail<T>(error: { code: string; message: string }): Result<T> {
    return { success: false, error };
  },
};
